import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AwsS3Service } from 'src/s3.service';
import { CreatePostDto, UpdatePostDto } from './post.dto';

@Injectable()
export class PostService {
    constructor(private readonly prisma: PrismaService, private readonly s3Service: AwsS3Service) {}

    async createPost(createPostDto: CreatePostDto, authorId: string, file: Express.Multer.File) {

        //find teacherId from authorId
        const teacher = await this.prisma.teacher.findFirst({
            where: { userId: authorId },
        });

        if (!teacher) {
            return {
                success: false,
                type: 'error',
                code: HttpStatus.NOT_FOUND,
                message: 'Teacher not found',
            };
        }

        const result = await this.prisma.post.create({
            data: {
                groupId: createPostDto.groupId,
                authorId: teacher.id,
                title: createPostDto.title,
                description: createPostDto.description,
                type: createPostDto.type,
                contentUrl: createPostDto.contentUrl,
                status: 'active',
            },
        });

        let response = result;

        if (createPostDto.type === 'video' || createPostDto.type === 'image') {
            //upload file to cloud storage and get the URL
            console.log('File:', file);
            if (!file) {
                return {
                    success: false,
                    type: 'error',
                    code: HttpStatus.BAD_REQUEST,
                    message: 'File is required for video or image post',
                };
            }
            //upload file to cloud storage
            const post = await this.uploadPostContent(file, result.id, createPostDto.type);

            if (post.success) {
                return {
                    success: true,
                    type: 'success',
                    code: HttpStatus.CREATED,
                    message: 'Post created successfully',
                    data: post.data,
                }
            }
        
        }



        return {
            success: true,
            type: 'success',
            code: HttpStatus.CREATED,
            message: 'Post created successfully',
            data: result,
        }
    }

    async updatePost(id: string, updatePostDto: UpdatePostDto) {
        const result = await this.prisma.post.update({
            where: { id },
            data: {
                groupId: updatePostDto.groupId,
                title: updatePostDto.title,
                description: updatePostDto.description,
                type: updatePostDto.type,
                contentUrl: updatePostDto.contentUrl,
                status: updatePostDto.status || 'active',
            },
        });
        return {
            success: true,
            type: 'success',
            code: HttpStatus.OK,
            message: 'Post updated successfully',
            data: result,
        }
    }

    async getPost(id: string) {
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: {
                PostLike: true,
                PostComment: true,
            },
        });
        return {
            success: true,
            type: 'success',
            code: HttpStatus.OK,
            message: 'Post retrieved successfully',
            data: post,
        }
    }

    async deletePost(id: string) {
        await this.prisma.post.delete({
            where: { id },
        });
        return {
            success: true,
            type: 'success',
            code: HttpStatus.OK,
            message: 'Post deleted successfully',
        }
    }

    async getPostsByGroup(groupId: string) {
        const posts = await this.prisma.post.findMany({
            where: { groupId },
            include: {
                PostLike: true,
                PostComment: true,
            },
        });
        return {
            success: true,
            type: 'success',
            code: HttpStatus.OK,
            message: 'Posts retrieved successfully',
            data: posts,
        }
    }

    async likePost(postId: string, userId: string) {
        const existingLike = await this.prisma.postLike.findFirst({
            where: { postId, userId },
        });

        if (existingLike) {
            return {
                success: false,
                type: 'error',
                code: HttpStatus.BAD_REQUEST,
                message: 'You have already liked this post',
            };
        }

        const like = await this.prisma.postLike.create({
            data: {
                postId,
                userId,
            },
        });

        return {
            success: true,
            type: 'success',
            code: HttpStatus.CREATED,
            message: 'Post liked successfully',
            data: like,
        };
    }

    async unlikePost(postId: string, userId: string) {
        const existingLike = await this.prisma.postLike.findFirst({
            where: { postId, userId },
        });

        if (!existingLike) {
            return {
                success: false,
                type: 'error',
                code: HttpStatus.BAD_REQUEST,
                message: 'You have not liked this post yet',
            };
        }

        await this.prisma.postLike.delete({
            where: { id: existingLike.id },
        });

        return {
            success: true,
            type: 'success',
            code: HttpStatus.OK,
            message: 'Post unliked successfully',
        };
    }

    async getPostLikes(postId: string) {
        const likes = await this.prisma.postLike.findMany({
            where: { postId },
            include: {
                user: true, // Assuming you have a user relation
            },
        });

        return {
            success: true,
            type: 'success',
            code: HttpStatus.OK,
            message: 'Post likes retrieved successfully',
            data: likes,
        };
    }

    async getPostComments(postId: string) {
        const comments = await this.prisma.postComment.findMany({
            where: { postId },
            include: {
                user: true, // Assuming you have a user relation
            },
        });

        return {
            success: true,
            type: 'success',
            code: HttpStatus.OK,
            message: 'Post comments retrieved successfully',
            data: comments,
        };
    }

    async addPostComment(postId: string, userId: string, content: string) {
        const comment = await this.prisma.postComment.create({
            data: {
                postId,
                userId,
                comment: content, // Use the correct property name as defined in your Prisma schema
            },
        });

        return {
            success: true,
            type: 'success',
            code: HttpStatus.CREATED,
            message: 'Comment added successfully',
            data: comment,
        };
    }

    async deletePostComment(commentId: string) {
        await this.prisma.postComment.delete({
            where: { id: commentId },
        });

        return {
            success: true,
            type: 'success',
            code: HttpStatus.OK,
            message: 'Comment deleted successfully',
        };
    }

    async uploadPostContent(file: Express.Multer.File, postId: string, type: string = 'video') {
        if (!file) {
            return {
                success: false,
                type: 'error',
                code: HttpStatus.BAD_REQUEST,
                message: 'No file uploaded',
            };
        }
        let contentUrl: string;
        if (type === 'video') {
            const upload = await this.s3Service.uploadWorkoutVideo(file);
            if (!upload) {
                return {
                    success: false,
                    type: 'error',
                    code: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Failed to upload video',
                };
            }
            contentUrl = upload;
        }
        else if (type === 'image') {
            const upload = await this.s3Service.uploadStorieImage(file);
            if (!upload) {
                return {
                    success: false,
                    type: 'error',
                    code: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Failed to upload image',
                };
            }
            contentUrl = upload;
        } else {
            return {
                success: false,
                type: 'error',
                code: HttpStatus.BAD_REQUEST,
                message: 'Unsupported content type',
            };
        }

        const post = await this.prisma.post.update({
            where: { id: postId },
            data: { contentUrl },
        });

        return {
            success: true,
            type: 'success',
            code: HttpStatus.OK,
            message: 'Post content uploaded successfully',
            data: post,
        };
    }

}
