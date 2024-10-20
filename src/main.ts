import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Set the ValidationPipe as a global pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that do not have decorators
    forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are found
    transform: true, // Automatically transform payloads to DTO instances
    // You can add more options here as needed
  }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('GoWagr Backend Engineering Test')
    .setDescription('A simple money transfer system RESTFUL API using NestJs ( with Typescript), PostgreSQL (TypeORM) by R.O.Olatunji')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  //The route to access Swagger UI
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
