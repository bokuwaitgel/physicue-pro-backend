import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, createTeacherDto, updateTeacherDto, loginUserDto,logoutUserDto} from './users.dto';

@Injectable()
export class UsersService {
  constructor(public prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    //check if user already exists
    const user = await this.prisma.user.findUnique({
      where: {
        firebaseId: createUserDto.firebaseId,
      },
    });
    if (user) {
      return {
            success: false,
            type: 'failed',
            message: 'User already exists',
            code: HttpStatus.FOUND
         }
    }

    try{
        const result = await this.prisma.user.create({
            data: {
              firebaseId: createUserDto.firebaseId,
              firebaseToken: createUserDto.firebaseToken,
              fcmToken: createUserDto.fcmToken,
              firstName: createUserDto.firstName,
              lastName: createUserDto.lastName,
              email: createUserDto.email,
              profileImage: createUserDto.profileImage,
              address: createUserDto.address,
              mobile: createUserDto.mobile,

              facebookAcc: createUserDto.facebookAcc,
              instagramAcc: createUserDto.instagramAcc,
            }
          });

          const body = await this.prisma.bodyHistory.create({
            data: {
              weight: createUserDto.body.weight,
              height: createUserDto.body.height,
              bodyType: createUserDto.body.bodyType,
              age: createUserDto.body.age,
              birthDate: createUserDto.body.birthDate,
              bodyIssue: createUserDto.body.bodyIssue,
              goal: createUserDto.body.goal,
              userId: result.id,
            }
          });
      
          return {
            success: true,
            type: 'success',
            message: 'User created',
            data: {
              user: result,
              body: body
            },
            code: HttpStatus.CREATED,
          }
    } catch (error) {
        return {
            success: false,
            type: 'failed',
            message: 'Error creating user',
            error: error,
            code: HttpStatus.INTERNAL_SERVER_ERROR
         }
    }
  }

  async login(loginUserDto: loginUserDto) {
    //check if user already exists
    const user = await this.prisma.user.findUnique({
      where: {
        firebaseId: loginUserDto.firebaseId,
      },
    });
    if (!user) {
        return {
            success: false,
            type: 'failed',
            message: 'User does not exists',
            code: HttpStatus.NOT_FOUND
         }
    }

    const update = await this.prisma.user.update({
      where: { firebaseId: loginUserDto.firebaseId },
      data: {
        firebaseToken: loginUserDto.firebaseToken,
        fcmToken: loginUserDto.fcmToken,
      },
    });

    return {
      success: true,
      type: 'success',
      message: 'User found',
      data: update,
      code: HttpStatus.OK
    }
  }

  async logout(logoutUserDto: logoutUserDto) {
    //check if user already exists
    const user = await this.prisma.user.findUnique({
      where: {
        firebaseId: logoutUserDto.firebaseId,
      },
    });
    if (!user) {
        return {
            success: false,
            type: 'failed',
            message: 'User does not exists',
            code: HttpStatus.NOT_FOUND
         }
    }

    const result = await this.prisma.user.update({
      where: { firebaseId: logoutUserDto.firebaseId },
      data: {
        firebaseToken: '',
        fcmToken: '',
      },
    });
  }

  async update(id: string, updateUserDto: Partial<CreateUserDto>) {
    //check if user already exists
    const user = await this.prisma.user.findUnique({
      where: {
        firebaseId: id,
      },
    });
    if (!user) {
        return {
            success: false,
            type: 'failed',
            message: 'User does not exists',
            code: HttpStatus.NOT_FOUND
         }
    }

    const result = await this.prisma.user.update({
      where: { firebaseId: id },
      data: {
        firebaseToken: updateUserDto.firebaseToken,
        fcmToken: updateUserDto.fcmToken,
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        email: updateUserDto.email,
        profileImage: updateUserDto.profileImage,
        address: updateUserDto.address,
        mobile: updateUserDto.mobile,

        facebookAcc: updateUserDto.facebookAcc,
        instagramAcc: updateUserDto.instagramAcc,
      },
    });

    let bodyHistory = await this.prisma.bodyHistory.findFirst({
      where: {
        userId: user.id
      }
    });
    if (updateUserDto.body) {

      if (bodyHistory) {
        bodyHistory = await this.prisma.bodyHistory.update({
          where: {
            id: bodyHistory.id
          },
          data: {
            weight: updateUserDto.body.weight,
            height: updateUserDto.body.height,
            bodyType: updateUserDto.body.bodyType,
            age: updateUserDto.body.age,
            birthDate: updateUserDto.body.birthDate,
            bodyIssue: updateUserDto.body.bodyIssue,
            goal: updateUserDto.body.goal,
          }
        });
      }
    }

    return {
      success: true,
      type: 'success',
      message: 'User updated',
      data: {
        user: result,
        body: bodyHistory
      },
      code: HttpStatus.OK,
    }
  }

  async delete(firebseId: string) {
    //check if user already exists
    const user = await this.prisma.user.findUnique({
      where: {
        firebaseId: firebseId,
      },
    });
    if (!user) {
        return {
            success: false,
            type: 'failed',
            message: 'User does not exists',
            code: HttpStatus.NOT_FOUND
         }
    }

    const result = await this.prisma.user.delete({
      where: { 
        firebaseId: firebseId
       },
    });

    return {
      success: true,
      type: 'success',
      message: 'User deleted',
      data: result,
      code: HttpStatus.OK,
    }
  }

  async get(firebseId: string) {
    //check if user exists
    const user = await this.prisma.user.findUnique({
      where: {
        firebaseId: firebseId,
      },
    });
    if (!user) {
        return {
            success: false,
            type: 'failed',
            message: 'User does not exists',
            code: HttpStatus.NOT_FOUND
         }
    }

    return {
      success: true,
      type: 'success',
      message: 'User found',
      data: user,
      code: HttpStatus.OK,
    }
  }

  async createTeacher(createTeacherDto: createTeacherDto) {
    //check if user already exists
    const user = await this.prisma.user.findUnique({
      where: {
        firebaseId: createTeacherDto.firebaseId,
      },
    });

    if (!user) {
      return {
            success: false,
            type: 'failed',
            message: 'User does not exists',
            code: HttpStatus.NOT_FOUND
      }
    }

    //check if teacher already exists
    const teacher = await this.prisma.teacher.findFirst({
        where: {
            userId: user.id,
        },
    });

    if (teacher) {
      return {
            success: false,
            type: 'failed',
            message: 'Teacher already exists',
            code: HttpStatus.FOUND
         }
    }

    try{
        const result = await this.prisma.teacher.create({
            data: {
                userId: user.id,
                description: createTeacherDto.description,
            },
          });
      
          return {
            success: true,
            type: 'success',
            message: 'Teacher created',
            data: result,
            code: HttpStatus.CREATED,
          }
    } catch (error) {
        return {
            success: false,
            type: 'failed',
            message: 'Error creating user',
            error: error,
            code: HttpStatus.INTERNAL_SERVER_ERROR
         }
    }
  }

  async updateTeacher(id: string, updateTeacher: updateTeacherDto) {
    const find_user = await this.prisma.user.findUnique({
        where: {
            firebaseId: id,
        },
    });

    if (!find_user) {
        return {
            success: false,
            type: 'failed',
            message: 'User does not exists',
            code: HttpStatus.NOT_FOUND
         }
    }

    //check if user already exists
    const user = await this.prisma.teacher.findFirst({
        where: {
            userId: find_user.id,
        },
    });
    if (!user) {
        return {
            success: false,
            type: 'failed',
            message: 'Teacher does not exists',
            code: HttpStatus.NOT_FOUND
         }
    }

    const result = await this.prisma.teacher.update({
      where: { id: user.id },
      data: {
        description: updateTeacher.description,
        status: updateTeacher.status ? updateTeacher.status : user.status,
      },
    });

    return {
      success: true,
      type: 'success',
      message: 'Teacher updated',
      data: result,
      code: HttpStatus.OK,
    }
  }

  async getTeacher(firebseId: string) {
    //check if user exists
    const user = await this.prisma.user.findUnique({
      where: {
        firebaseId: firebseId,
      },
    });
    if (!user) {
        return {
            success: false,
            type: 'failed',
            message: 'User does not exists',
            code: HttpStatus.NOT_FOUND
         }
    }

    const teacher = await this.prisma.teacher.findFirst({
        where: {
            userId: user.id
        },
    });

    if (!teacher) {
        return {
            success: false,
            type: 'failed',
            message: 'Teacher does not exists',
            code: HttpStatus.NOT_FOUND
         }
    }

    return {
      success: true,
      type: 'success',
      message: 'Teacher found',
      data: teacher,
      code: HttpStatus.OK,
    }
  }
  // get teachers
  async getTeachers() {
    const teachers = await this.prisma.teacher.findMany({
      where: {
        status: 'active'
      },
      orderBy: {
        rating: 'desc'
      }
    });
    return {
      success: true,
      type: 'success',
      message: 'Teachers found',
      data: teachers,
      code: HttpStatus.OK,
    }
  }

  // get user groups
  async getUserGroups(firebseId: string) {
    //check if user exists
    const user = await this.prisma.user.findUnique({
      where: {
        firebaseId: firebseId,
      },
    });
    if (!user) {
        return {
            success: false,
            type: 'failed',
            message: 'User does not exists',
            code: HttpStatus.NOT_FOUND
         }
    }

    const userGroups = await this.prisma.groupMembers.findMany({
        where: {
            userId: user.id,
            status: 'active',
            Role: "member"
        },
    });

    const groups: Array<{ id: string; description: string; status: string; createdAt: Date; updatedAt: Date; name: string; bannerImage: string; requirements: string; adminId: string; }> = [];
    for (const group of userGroups) {
      const groupData = await this.prisma.group.findUnique({
        where: {
          id: group.groupId
        }
      });
      if (groupData) {
        groups.push(groupData);
    }


    return {
      success: true,
      type: 'success',
      message: 'User groups found',
      data: groups,
      code: HttpStatus.OK,
    }
  }
}

}
