import { ApiProperty } from '@nestjs/swagger';

export class GenericSuccessResponseDTO {
  @ApiProperty({
    description:
      'Returns true or false depending on whether the request was successful',
  })
  success: boolean;
}
