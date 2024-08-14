import { type INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(
  app: INestApplication,
  configService: ConfigService,
): void {
  const logger = new Logger('Swagger');
  const appURL = configService.getOrThrow('app.appURL');

  const documentBuilder = new DocumentBuilder()
    .setTitle('API')
    .setDescription(
      `### REST

<details><summary>Detailed specification</summary>
<p>

**List:**
  - \`GET /<resources>/\`
    - Get the list of **<resources>** as admin
  - \`GET /user/<user_id>/<resources>/\`
    - Get the list of **<resources>** for a given **<user_id>**
    - Output a **403** if logged user is not **<user_id>**

**Detail:**
  - \`GET /<resources>/<resource_id>\`
    - Get the detail for **<resources>** of id **<resource_id>**
    - Output a **404** if not found
  - \`GET /user/<user_id>/<resources>/<resource_id>\`
    - Get the list of **<resources>** for a given **user_id**
    - Output a **404** if not found
    - Output a **403** if:
      - Logged user is not **<user_id>**
      - The **<user_id>** have no access to **<resource_id>**

**Creation / Edition / Replacement / Suppression:**
  - \`<METHOD>\` is:
    - **POST** for creation
    - **PATCH** for update (one or more fields)
    - **PUT** for replacement (all fields, not used)
    - **DELETE** for suppression (all fields, not used)
  - \`<METHOD> /<resources>/<resource_id>\`
    - Create **<resources>** with id **<resource_id>** as admin
    - Output a **400** if **<resource_id>** conflicts with existing **<resources>**
  - \`<METHOD> /user/<user_id>/<resources>/<resource_id>\`
    - Create **<resources>** with id **<resource_id>** as a given **user_id**
    - Output a **409** if **<resource_id>** conflicts with existing **<resources>**
    - Output a **403** if:
      - Logged user is not **<user_id>**
      - The **<user_id>** have no access to **<resource_id>**
</p>
</details>`,
    )
    .addBearerAuth();

  const apiVersion = configService.get('app.apiVersion');

  if (apiVersion) {
    documentBuilder.setVersion(apiVersion);
  }

  const document = SwaggerModule.createDocument(app, documentBuilder.build());

  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  SwaggerModule.setup('/', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  logger.log('Mapped {/, GET} Swagger api route', 'RouterExplorer');
  logger.log('Mapped {/api-docs, GET} Swagger api route', 'RouterExplorer');

  logger.log(`Documentation: ${appURL}/api-docs`);
  logger.log(`Documentation: ${appURL}`);
}
