import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AwsS3Service } from 'src/s3.service';
import { CreateUserDto, createTeacherDto, updateTeacherDto, loginUserDto, logoutUserDto, createSubPlanDto, updateSubPlanDto} from './users.dto';
import { parse } from 'path';

@Injectable()
export class UsersService {
  constructor(public prisma: PrismaService) {}

  // async create(createUserDto: CreateUserDto) {
  //   //check if user already exists
  //   const user = await this.prisma.user.findUnique({
  //     where: {
  //       userId: createUserDto.userId,
  //     },
  //   });
  //   if (user) {
  //     return {
  //           success: false,
  //           type: 'failed',
  //           message: 'User already exists',
  //           code: HttpStatus.FOUND
  //        }
  //   }

  //   try{
  //       const result = await this.prisma.user.create({
  //           data: {
  //             userId: createUserDto.userId,
  //             firebaseToken: createUserDto.firebaseToken,
  //             fcmToken: createUserDto.fcmToken,
  //             firstName: createUserDto.firstName,
  //             lastName: createUserDto.lastName,
  //             email: createUserDto.email,
  //             profileImage: createUserDto.profileImage,
  //             address: createUserDto.address,
  //             mobile: createUserDto.mobile,

  //             facebookAcc: createUserDto.facebookAcc,
  //             instagramAcc: createUserDto.instagramAcc,
  //           }
  //         });

  //         const body = await this.prisma.bodyHistory.create({
  //           data: {
  //             weight: createUserDto.persona.weight,
  //             height: createUserDto.persona.height,
  //             bodyType: createUserDto.persona.bodyType,
  //             age: createUserDto.persona.age,
  //             birthDate: createUserDto.persona.birthDate,
  //             bodyIssue: createUserDto.persona.bodyIssue,
  //             goal: createUserDto.persona.goal,
  //             userId: result.id,
  //           }
  //         });
      
  //         return {
  //           success: true,
  //           type: 'success',
  //           message: 'User created',
  //           data: {
  //             user: {
  //               ...result,
  //               persona: body
  //             }
  //           },
  //           code: HttpStatus.CREATED,
  //         }
  //   } catch (error) {
  //       return {
  //           success: false,
  //           type: 'failed',
  //           message: 'Error creating user',
  //           error: error,
  //           code: HttpStatus.INTERNAL_SERVER_ERROR
  //        }
  //   }
  // }

  // async login(loginUserDto: loginUserDto) {
  //   //check if user already exists
  //   const user = await this.prisma.user.findUnique({
  //     where: {
  //       userId: loginUserDto.userId,
  //     },
  //   });
  //   if (!user) {
  //       return {
  //           success: false,
  //           type: 'failed',
  //           message: 'User does not exists',
  //           code: HttpStatus.NOT_FOUND
  //        }
  //   }

  //   const update = await this.prisma.user.update({
  //     where: { userId: loginUserDto.userId },
  //     data: {
  //       firebaseToken: loginUserDto.firebaseToken,
  //       fcmToken: loginUserDto.fcmToken,
  //     },
  //   });

  //   const body = await this.prisma.bodyHistory.findFirst({
  //     where: {
  //       userId: user.id
  //     }
  //   });

  //   return {
  //     success: true,
  //     type: 'success',
  //     message: 'User found',
  //     data: {
  //       user: {
  //         ...update,
  //         persona: body
  //       }
  //     },
  //     code: HttpStatus.OK
  //   }
  // }

  // async logout(logoutUserDto: logoutUserDto) {
  //   //check if user already exists
  //   const user = await this.prisma.user.findUnique({
  //     where: {
  //       userId: logoutUserDto.userId,
  //     },
  //   });
  //   if (!user) {
  //       return {
  //           success: false,
  //           type: 'failed',
  //           message: 'User does not exists',
  //           code: HttpStatus.NOT_FOUND
  //        }
  //   }

  //   const result = await this.prisma.user.update({
  //     where: { userId: logoutUserDto.userId },
  //     data: {
  //       firebaseToken: '',
  //       fcmToken: '',
  //     },
  //   });

  //   return {
  //     success: true,
  //     type: 'success',
  //     message: 'User logged out',
  //     code: HttpStatus.OK
  //   }
  // }

  async update(id: string, updateUserDto: Partial<CreateUserDto>) {
    //check if user already exists
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
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
      where: { id: id },
      data: {
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
    if (updateUserDto.persona) {
      if (bodyHistory) {
        bodyHistory = await this.prisma.bodyHistory.update({
          where: {
            id: bodyHistory.id
          },
          data: {
            weight: updateUserDto.persona.weight,
            height: updateUserDto.persona.height,
            bodyType: updateUserDto.persona.bodyType,
            gender: updateUserDto.persona.gender ? updateUserDto.persona.gender : '',
            workoutRepeat: updateUserDto.persona?.workoutRepeat ? updateUserDto.persona.workoutRepeat : '',
            age: updateUserDto.persona.age,
            birthDate: updateUserDto.persona.birthDate,
            bodyIssue: updateUserDto.persona.bodyIssue,
            goal: updateUserDto.persona.goal,
          }
        });
      }else{
        bodyHistory = await this.prisma.bodyHistory.create({
          data: {
            weight: updateUserDto.persona.weight,
            height: updateUserDto.persona.height,
            bodyType: updateUserDto.persona.bodyType,
            age: updateUserDto.persona.age,
            gender: updateUserDto.persona.gender ? updateUserDto.persona.gender : '',
            workoutRepeat: updateUserDto.persona?.workoutRepeat ? updateUserDto.persona.workoutRepeat : '',
            birthDate: updateUserDto.persona.birthDate,
            bodyIssue: updateUserDto.persona.bodyIssue,
            goal: updateUserDto.persona.goal,
            userId: user.id
          }
        });
      }
    }

    return {
      success: true,
      type: 'success',
      message: 'User updated',
      data: {
        user:{
          ...result,
          persona: bodyHistory
        }
      },
      code: HttpStatus.OK,
    }
  }

  async delete(userId: string) {
    //check if user already exists
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
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
        id: userId
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

  async get(userId: string) {
    //check if user exists
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
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

    const body = await this.prisma.bodyHistory.findFirst({
      where: {
        userId: user.id
      }
    });

    //check is user is teacher
    const teacher = await this.prisma.teacher.findFirst({
      where: {
        userId: user.id
      }
    });

    let subs = await this.prisma.subscription.findFirst({
      where: {
        userId: user.id
      }
    });

    if (!subs) {
      const subscription = await this.prisma.subscription.create({
        data: {
          userId: user.id,
          tag: 'free',
          status: 'active',
          startDate: user.createdAt,
          endDate: user.createdAt,
        },
      });
      subs = subscription;
    }

    return {
      success: true,
      type: 'success',
      message: 'User found',
      data: {
        user: {
          ...user,
          role: teacher ? 'teacher' : 'user',
          persona: body,
          subscription: subs
        },
        is_teacher: teacher ? true : false,
        teacher_id: teacher ? teacher.id : ''
      },
      code: HttpStatus.OK,
    }
  }

  async createTeacher(createTeacherDto: createTeacherDto) {
    //check if user already exists
    const user = await this.prisma.user.findUnique({
      where: {
        id: createTeacherDto.userId,
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
            id: id,
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

  async getTeacher(userId: string) {
    //check if user exists
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
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
  async getUserGroups(userId: string) {
    //check if user exists
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
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

  // upload profile image to s3 bucket
  async uploadProfileImage(userId: string, data: any) {
    const s3 = new AwsS3Service();
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
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



    try {
      const result = await s3.uploadProfileImage(data);
      const update = await this.prisma.user.update({
        where: { id: userId },
        data: {
          profileImage: result,
        },
      });
  
      return {
        success: true,
        type: 'success',
        message: 'Profile image uploaded',
        data: update,
        code: HttpStatus.OK,
      }
    }
    catch (error) {
      return {
        success: false,
        type: 'failed',
        message: 'Error uploading image',
        error: error,
        code: HttpStatus.INTERNAL_SERVER_ERROR
      }
    }
  }

  async findByLogin(email: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: { email: email }
    });
    return user;
  }
  

  async isTermAccepted(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return {
        success: false,
        type: 'failed',
        message: 'User does not exists',
        code: HttpStatus.NOT_FOUND
      }
    }
    if (user.isTermAccepted) {
      return {
        success: true,
        type: 'success',
        message: 'Already accepted terms',
        data: user.isTermAccepted,
        code: HttpStatus.OK
      }
    }

    const result = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isTermAccepted: true
      }
    });
    return {
      success: true,
      type: 'success',
      message: 'Terms accepted',
      data: {
        isTermAccepted: result.isTermAccepted
      },
      code: HttpStatus.OK
    }

  }

  async createPlan(date: createSubPlanDto): Promise<any> {
    
    const result = await this.prisma.subscriptionPlan.create({
      data: {
        planName: date.planName,
        cost: date.cost,
        duration: parseInt(date.duration),
      }
    });

    if (!result) {
      return {
        success: false,
        type: 'failed',
        message: 'Error creating plan',
        code: HttpStatus.INTERNAL_SERVER_ERROR
      }
    }
    return {
      success: true,
      type: 'success',
      message: 'Plan created',
      data: result,
      code: HttpStatus.OK
    }
    
  }

  async updatePlan(id: string, date: updateSubPlanDto): Promise<any> {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: id }
    });
    if (!plan) {
      return {
        success: false,
        type: 'failed',
        message: 'Plan does not exists',
        code: HttpStatus.NOT_FOUND
      }
    }

    const result = await this.prisma.subscriptionPlan.update({
      where: { id: id },
      data: {
        planName: date.planName,
        cost: date.cost,
        duration: parseInt(date.duration),
      }
    });

    return {
      success: true,
      type: 'success',
      message: 'Plan updated',
      data: result,
      code: HttpStatus.OK
    }
  }

  async getPlans(): Promise<any> {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: {
        status: 'active'
      }
    });
    return {
      success: true,
      type: 'success',
      message: 'Plans found',
      data: plans,
      code: HttpStatus.OK
    }
  }

  async subscribePlan(userId: string, planId: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId }
    });
    if (!user) {
      return {
        success: false,
        type: 'failed',
        message: 'User does not exists',
        code: HttpStatus.NOT_FOUND
      }
    }

    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });
    if (!plan) {
      return {
        success: false,
        type: 'failed',
        message: 'Plan does not exists',
        code: HttpStatus.NOT_FOUND
      }
    }

    const getSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId: user.id,
      }
    });

    
    if (!getSubscription) {
     return {
        success: false,
        type: 'failed',
        message: 'No subscription found',
        code: HttpStatus.NOT_FOUND
      }
    }
    var start = new Date();

    if (start > new Date(getSubscription.endDate) ){
      start = new Date(getSubscription.startDate)
    }

    var end = new Date(getSubscription.endDate);

    // add duration (day) to end date
    const duration = plan.duration;
    const newEndDate = new Date(end.setDate(end.getDate() + duration));


    if (!getSubscription) {
      const result = await this.prisma.subscription.create({
        data: {
          userId: user.id,
          status: 'active',
          tag: plan.planName,
          startDate: start,
          endDate: newEndDate,
          // endDate: new Date(new Date().setMonth(new Date().getMonth() + plan.duration))

        }
      });
    }

    const ct = await this.prisma.subscriptionHistory.create({
      data: {
        userId: user.id,
        subscriptionPlanId: plan.id
      }
    });

    if (!ct) {
      return {
        success: false,
        type: 'failed',
        message: 'Error creating subscription history',
        code: HttpStatus.INTERNAL_SERVER_ERROR
      }
    }

    if(!getSubscription){
      return {
        success: false,
        type: 'false',
        message: 'Error creating subscription',
        code: HttpStatus.OK
      }
    }

    //date update 
    const updated_date = new Date(getSubscription.endDate) 

    const newDate = new Date(updated_date.setDate(updated_date.getDate() + plan.duration));


    const result = await this.prisma.subscription.update({
      where: { id: getSubscription?.id || '' },
      data: {
        tag: plan.planName,
        endDate: newDate,
      }
    });

    return {
      success: true,
      type: 'success',
      message: 'Plan subscribed',
      data: result,
      code: HttpStatus.OK
    }
  }

  async getSubscribedPlan(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
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

    const subscriptionHistory = await this.prisma.subscriptionHistory.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      success: true,
      type: 'success',
      message: 'Subscribed plan found',
      data: subscriptionHistory,
      code: HttpStatus.OK
    }

  }
}
