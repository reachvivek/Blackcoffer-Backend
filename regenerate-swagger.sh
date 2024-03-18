# Re Generates the client library in the frontend project

java -jar ./swagger-codegen-cli.jar generate -i ./public/swagger/swagger.yaml -l typescript-angular -o ../frontend/src/swagger --api-package "blackcoffer" --additional-properties ngVersion=17.0.0,providedInRoot=true,supportsES6=true,modelPropertyNaming=original,npmName="blackcoffer",sortParamsByRequiredFlag=true
cd ../frontend
./sanitize-swagger.sh
