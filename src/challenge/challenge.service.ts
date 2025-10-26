import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService, ChallengeTypes } from '../prisma/prisma.service';
import {
  CreateChallengeDto,
  UpdateChallengeDto,
  EnrollChallengeDto,
  UpdateProgressDto,
  ChallengeResponseDto,
  EnrollmentResponseDto,
  LeaderboardDto,
} from './challenge.dto';

@Injectable()
export class ChallengeService {
  constructor(private readonly prisma: PrismaService) {}

  async getChallengeTypes(): Promise<any> {
    return {
        status: true,
        type: 'success',
        message: 'Challenge types retrieved successfully',
        data: Object.values(ChallengeTypes),
    }
  }

  // ============================================================================
  // CHALLENGE CRUD OPERATIONS
  // ============================================================================

  async createChallenge(createChallengeDto: CreateChallengeDto): Promise<any> {
    const { instructions, tier, type, ...challengeData } = createChallengeDto;

    const challenge = await this.prisma.challenge.create({
      data: {
        ...challengeData,
        tier: Array.isArray(tier) ? tier[0] : tier,
        type: { set: Array.isArray(type) ? type : [type] },
        ChallengeInstruction: {
          create: instructions?.map((instruction) => ({ instruction })) || [],
        },
      },
      include: {
        ChallengeInstruction: true,
      },
    });

    return {
        status: true,
        type: 'success',
        message: 'Challenge created successfully',
        data: this.mapToChallengeResponse(challenge),
    }
  }

  async getAllChallenges(userId?: string): Promise<any> {
    const challenges = await this.prisma.challenge.findMany({
      where: {
        status: 'active',
      },
      include: {
        ChallengeInstruction: true,
        ChallengeEnrollment: userId ? {
          where: { userId },
        } : false,
        _count: {
          select: {
            ChallengeEnrollment: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const result = challenges.map((challenge) => ({
      ...this.mapToChallengeResponse(challenge),
      enrollmentCount: challenge._count.ChallengeEnrollment,
      isEnrolled: userId ? challenge.ChallengeEnrollment?.length > 0 : undefined,
    }));
    return {
      status: true,
      type: 'success',
      message: 'Challenges retrieved successfully',
      data: result,
    };

  }

  async getChallengeById(id: string, userId?: string): Promise<any> {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
      include: {
        ChallengeInstruction: true,
        ChallengeEnrollment: userId ? {
          where: { userId },
        } : false,
        _count: {
          select: {
            ChallengeEnrollment: true,
          },
        },
      },
    });

    if (!challenge) {
      return {
        status: false,
        type: 'error',
        message: `Challenge with ID ${id} not found`,
        data: [],
      }
    }

    const result = {
      ...this.mapToChallengeResponse(challenge),
      enrollmentCount: challenge._count.ChallengeEnrollment,
      isEnrolled: userId ? challenge.ChallengeEnrollment?.length > 0 : undefined,
    };

    return {
        status: true,
        type: 'success',
        message: 'Challenge retrieved successfully',
        data: result,
    };
  }

  async updateChallenge(id: string, updateChallengeDto: UpdateChallengeDto): Promise<any> {
    const { instructions, tier, type, ...challengeData } = updateChallengeDto;

    // Check if challenge exists
    const existingChallenge = await this.prisma.challenge.findUnique({
      where: { id },
    });

    if (!existingChallenge) {
      throw new NotFoundException(`Challenge with ID ${id} not found`);
    }

    // Update challenge
    const challenge = await this.prisma.challenge.update({
      where: { id },
      data: {
        ...challengeData,
        ...(tier !== undefined && { tier: Array.isArray(tier) ? tier[0] : tier }),
        ...(type !== undefined && { type: { set: Array.isArray(type) ? type : [type] } }),
      },
      include: {
        ChallengeInstruction: true,
      },
    });

    // Update instructions if provided
    if (instructions) {
      // Delete existing instructions
      await this.prisma.challengeInstruction.deleteMany({
        where: { challengeId: id },
      });

      // Create new instructions
      await this.prisma.challengeInstruction.createMany({
        data: instructions.map((instruction) => ({
          challengeId: id,
          instruction,
        })),
      });
    }

    // Fetch updated challenge with instructions
    const updatedChallenge = await this.prisma.challenge.findUnique({
      where: { id },
      include: {
        ChallengeInstruction: true,
        _count: {
          select: {
            ChallengeEnrollment: true,
          },
        },
      },
    });

    if (!updatedChallenge) {
      throw new NotFoundException(`Challenge with ID ${id} not found`);
    }

    const result = {
      ...this.mapToChallengeResponse(updatedChallenge),
      enrollmentCount: updatedChallenge._count.ChallengeEnrollment,
    };
    return {
      status: true,
      type: 'success',
      message: 'Challenge updated successfully',
      data: result,
    };
  }

  async deleteChallenge(id: string): Promise<any> {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
    });

    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${id} not found`);
    }

    // Soft delete by updating status
    await this.prisma.challenge.update({
      where: { id },
      data: { status: 'deleted' },
    });

    return {
        status: true,
        type: 'success',
        message: 'Challenge deleted successfully',
        data: { message: 'Challenge deleted successfully' },
    };
  }

  // ============================================================================
  // ENROLLMENT OPERATIONS
  // ============================================================================

  async enrollInChallenge(userId: string, enrollChallengeDto: EnrollChallengeDto): Promise<any> {
    const { challengeId, startDate } = enrollChallengeDto;

    // Check if challenge exists
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${challengeId} not found`);
    }

    if (challenge.status !== 'active') {
      throw new BadRequestException('This challenge is not active');
    }

    // Check if user is already enrolled
    const existingEnrollment = await this.prisma.challengeEnrollment.findFirst({
      where: {
        userId,
        challengeId,
        status: 'active',
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('You are already enrolled in this challenge');
    }

    // Calculate end date
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + challenge.duration);

    // Create enrollment
    const enrollment = await this.prisma.challengeEnrollment.create({
      data: {
        userId,
        challengeId,
        startDate: start,
        endDate: end,
        status: 'active',
        isCompleted: false,
      },
      include: {
        Challenge: {
          include: {
            ChallengeInstruction: true,
          },
        },
      },
    });

    return {
        status: true,
        type: 'success',
        message: 'Enrolled in challenge successfully',
        data: this.mapToEnrollmentResponse(enrollment),
    };
  }

  async getUserEnrollments(userId: string): Promise<any> {
    const enrollments = await this.prisma.challengeEnrollment.findMany({
      where: { userId },
      include: {
        Challenge: {
          include: {
            ChallengeInstruction: true,
          },
        },
        User: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get total points for each enrollment
    const enrollmentsWithPoints = await Promise.all(
      enrollments.map(async (enrollment) => {
        const points = await this.prisma.challengePoint.aggregate({
          where: {
            userId,
            challengeId: enrollment.challengeId,
          },
          _sum: {
            pointsEarned: true,
          },
        });

        return {
          ...this.mapToEnrollmentResponse(enrollment),
          totalPoints: points._sum.pointsEarned || 0,
        };
      }),
    );

    return {
      status: true,
      type: 'success',
      message: 'User enrollments retrieved successfully',
      data: enrollmentsWithPoints,
    };
  }

  async updateChallengeProgress(userId: string, updateProgressDto: UpdateProgressDto): Promise<any> {
    const { enrollmentId, isCompleted } = updateProgressDto;

    // Check if enrollment exists and belongs to user
    const enrollment = await this.prisma.challengeEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        Challenge: true,
      },
    });

    if (!enrollment) {
        return {
            status: false,
            type: 'error',
            message: `Enrollment with ID ${enrollmentId} not found`,
        
        };
    }

    if (enrollment.userId !== userId) {
      return {
          status: false,
          message: 'This enrollment does not belong to you',
          type: 'error',
      };
    }

    if (isCompleted && enrollment.isCompleted) {
      return {
          status: false,
          message: 'This challenge is already marked as completed',
          type: 'error',
      };
    }

    const pointsEarned = enrollment.Challenge.point;

    // Add points
    await this.prisma.challengePoint.create({
      data: {
        userId,
        challengeId: enrollment.challengeId,
        pointsEarned,
      },
    });

    const updatedEnrollment = await this.prisma.challengeEnrollment.update({
      where: { id: enrollmentId },
      data: {
        isCompleted: isCompleted ? isCompleted : false,
      },
      include: {
        Challenge: {
          include: {
            ChallengeInstruction: true,
          },
        },
      },
    });

    // Get total points
    const points = await this.prisma.challengePoint.aggregate({
      where: {
        userId,
        challengeId: enrollment.challengeId,
      },
      _sum: {
        pointsEarned: true,
      },
    });

    const result = {
      ...this.mapToEnrollmentResponse(updatedEnrollment),
      totalPoints: points._sum.pointsEarned || 0,
    };
    return {
      status: true,
      type: 'success',
      message: 'Challenge progress updated successfully',
      data: result,
    };
  }

  async cancelEnrollment(userId: string, enrollmentId: string): Promise<any> {
    const enrollment = await this.prisma.challengeEnrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${enrollmentId} not found`);
    }

    if (enrollment.userId !== userId) {
      throw new BadRequestException('This enrollment does not belong to you');
    }

    const result = await this.prisma.challengeEnrollment.update({
      where: { id: enrollmentId },
      data: { status: 'cancelled' },
    });

    return {
        status: true,
        type: 'success',
        message: 'Enrollment cancelled successfully',
        data: result,
    };
  }

  // ============================================================================
  // LEADERBOARD & STATISTICS
  // ============================================================================

  async getLeaderboard(limit: number = 10): Promise<any> {
    const userPoints = await this.prisma.challengePoint.groupBy({
      by: ['userId'],
      _sum: {
        pointsEarned: true,
      },
      orderBy: {
        _sum: {
          pointsEarned: 'desc',
        },
      },
      take: limit,
    });

    const leaderboard = await Promise.all(
      userPoints.map(async (userPoint, index) => {
        const user = await this.prisma.user.findUnique({
          where: { id: userPoint.userId },
        });

        const completedChallenges = await this.prisma.challengeEnrollment.count({
          where: {
            userId: userPoint.userId,
            isCompleted: true,
          },
        });

        const result: LeaderboardDto = {
          userId: userPoint.userId,
          userName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Anonymous',
          userImage: user?.profileImage || '',
          totalPoints: userPoint._sum.pointsEarned || 0,
          challengesCompleted: completedChallenges,
          rank: index + 1,
        };
        return result;
      }),
    );

    return {
        status: true,
        type: 'success',
        message: 'Leaderboard retrieved successfully',
        data: leaderboard,
    };
  }

  async getUserStats(userId: string) {
    const totalPoints = await this.prisma.challengePoint.aggregate({
      where: { userId },
      _sum: {
        pointsEarned: true,
      },
    });

    const enrollments = await this.prisma.challengeEnrollment.findMany({
      where: { userId },
    });

    const completedChallenges = enrollments.filter((e) => e.isCompleted).length;
    const activeChallenges = enrollments.filter((e) => e.status === 'active' && !e.isCompleted).length;

    // Get user rank
    const allUserPoints = await this.prisma.challengePoint.groupBy({
      by: ['userId'],
      _sum: {
        pointsEarned: true,
      },
      orderBy: {
        _sum: {
          pointsEarned: 'desc',
        },
      },
    });

    const userRank = allUserPoints.findIndex((up) => up.userId === userId) + 1;

    return {
      status: true,
      type: 'success',
      message: 'User stats retrieved successfully',
      data: {
        totalPoints: totalPoints._sum.pointsEarned || 0,
        completedChallenges,
        activeChallenges,
        totalEnrollments: enrollments.length,
        rank: userRank || 0,
      },
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private mapToChallengeResponse(challenge: any): ChallengeResponseDto {
    return {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      imageUrl: challenge.imageUrl,
      duration: challenge.duration,
      point: challenge.point,
      type: challenge.type,
      status: challenge.status,
      goal: challenge.goal,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
      instructions: challenge.ChallengeInstruction?.map((instruction) => ({
        id: instruction.id,
        instruction: instruction.instruction,
      })),
    };
  }

  private mapToEnrollmentResponse(enrollment: any): EnrollmentResponseDto {
    return {
      id: enrollment.id,
      challengeId: enrollment.challengeId,
      userId: enrollment.userId,
      startDate: enrollment.startDate,
      endDate: enrollment.endDate,
      status: enrollment.status,
      isCompleted: enrollment.isCompleted,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
      challenge: enrollment.Challenge ? this.mapToChallengeResponse(enrollment.Challenge) : undefined,
    };
  }
}
