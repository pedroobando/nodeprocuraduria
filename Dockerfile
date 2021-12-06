# FROM mcr.microsoft.com/windows/servercore:1803 as installer
FROM mcr.microsoft.com/windows/nanoserver:1803

WORKDIR C:\nodejs
COPY --from=installer C:\nodejs\ .
RUN SETX PATH C:\nodejs
RUN npm config set registry https://registry.npmjs.org/

WORKDIR /app

# install and cache app dependencies
COPY src/WebSpa/package.json /app/src/WebSpa/package.json

WORKDIR /app/src/WebSpa
RUN npm install
RUN npm install -g @angular/cli@latest

# add app
COPY . /app

# start app
CMD cd /app/src/WebSpa && ng serve --host 0.0.0.0

