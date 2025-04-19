import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';



export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
