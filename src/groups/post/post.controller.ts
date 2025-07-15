import { Body, Controller, Delete, Get, Post, Put, Param, UseInterceptors, UploadedFile, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PostService } from './post.service';

import { CreatePostDto, UpdatePostDto } from './post.dto';


@Controller('post')
export class PostController {
    constructor(
        private readonly postService: PostService,
        private readonly authService: AuthService,
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiTags('Post')
    @UseInterceptors(FileInterceptor('contentFile'))
    @ApiOperation({ summary: 'Create a new post' })
    @ApiResponse({ status: 201, description: 'Post created successfully.' })
    async createPost(@Body() createPostDto: CreatePostDto, @Headers('authorization') auth: string, @UploadedFile() file: Express.Multer.File,) {
        const decoded = await this.authService.verifyToken({ token: auth });
        if (decoded.code != 200) {
            return decoded;
        }
        const authorId = decoded.data.id;
        return this.postService.createPost(createPostDto, authorId, file);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiTags('Post')
    @ApiOperation({ summary: 'Update an existing post' })
    @ApiResponse({ status: 200, description: 'Post updated successfully.' })
    async updatePost(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
        return this.postService.updatePost(id, updatePostDto);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiTags('Post')
    @ApiOperation({ summary: 'Get a post by ID' })
    @ApiResponse({ status: 200, description: 'Post retrieved successfully.' })
    async getPost(@Param('id') id: string) {
        return this.postService.getPost(id);
    }


    @Get('group/:groupId')
    @UseGuards(JwtAuthGuard)
    @ApiTags('Post')
    @ApiOperation({ summary: 'Get all posts by group ID' })
    @ApiResponse({ status: 200, description: 'Posts retrieved successfully.' })
    async getPostsByGroup(@Param('groupId') groupId: string) {
        return this.postService.getPostsByGroup(groupId);
    }


    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiTags('Post')
    @ApiOperation({ summary: 'Delete a post by ID' })
    @ApiResponse({ status: 200, description: 'Post deleted successfully.' })
    async deletePost(@Param('id') id: string) {
        return this.postService.deletePost(id);
    }

    @Post('like')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiTags('Post')
    @ApiOperation({ summary: 'Like a post' })
    @ApiResponse({ status: 201, description: 'Post liked successfully.' })
    async likePost(@Body() body: { postId: string }, @Headers('authorization') auth: string) {
        const decoded = await this.authService.verifyToken({ token: auth });
        if (decoded.code != 200) {
            return decoded;
        }
        const userId = decoded.data.id;

        return this.postService.likePost(body.postId, userId);
    }

    @Post('unlike')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiTags('Post')
    @ApiOperation({ summary: 'Unlike a post' })
    @ApiResponse({ status: 200, description: 'Post unliked successfully.' })
    async unlikePost(@Body() body: { postId: string }, @Headers('authorization') auth: string) {
        const decoded = await this.authService.verifyToken({ token: auth });
        if (decoded.code != 200) {
            return decoded;
        }
        const userId = decoded.data.id;
        return this.postService.unlikePost(body.postId, userId);
    }

    @Get('likes/:postId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiTags('Post')
    @ApiOperation({ summary: 'Get likes for a post' })
    @ApiResponse({ status: 200, description: 'Likes retrieved successfully.' })
    async getPostLikes(@Param('postId') postId: string) {
        return this.postService.getPostLikes(postId);
    }

    @Get('comments/:postId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiTags('Post')
    @ApiOperation({ summary: 'Get comments for a post' })
    @ApiResponse({ status: 200, description: 'Comments retrieved successfully.' })
    async getPostComments(@Param('postId') postId: string) {
        return this.postService.getPostComments(postId);
    }

    @Post('comment')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiTags('Post')
    @ApiOperation({ summary: 'Add a comment to a post' })
    @ApiResponse({ status: 201, description: 'Comment added successfully.' })
    async addComment(@Body() body: { postId: string, content: string },
        @Headers('authorization') auth: string) {
        const decoded = await this.authService.verifyToken({ token: auth });
        if (decoded.code != 200) {
            return decoded;
        }
        const userId = decoded.data.id;

        return this.postService.addPostComment(body.postId, body.content, userId);
    }

    @Delete('comment/:commentId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiTags('Post')
    @ApiOperation({ summary: 'Delete a comment from a post' })
    @ApiResponse({ status: 200, description: 'Comment deleted successfully.' })
    async deleteComment(@Param('commentId') commentId: string) {
        return this.postService.deletePostComment(commentId);
    }

}
