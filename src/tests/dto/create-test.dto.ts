import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTestDto{
    @IsString()
    @IsNotEmpty()
    title : string;

    @IsOptional()
    @IsString()
    description : string
}

