pipeline {
    agent any
    environment {
        APP_PORT = "3000"
        IMAGE_NAME = "my-coffee-shop"
    }
    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'master', url: 'https://github.com/AhnHao/MyCoffeeShop.git'  
            }
        }
        stage('Load .env from Jenkins Credentials') {
            steps {
                withCredentials([file(credentialsId: 'my-env-file', variable: 'ENV_FILE')]) {
                    sh "cp $ENV_FILE .env"
                }
            }
        }
        stage('Clean Old Docker Resources') {
            steps {
                script {
                    sh "docker stop ${IMAGE_NAME} || true"
                    sh "docker rm ${IMAGE_NAME} || true"
                    sh "docker rmi ${IMAGE_NAME} || true"
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME} ."
            }
        }
        stage('Run Docker Container') {
            steps {
                sh "docker run -d --name ${IMAGE_NAME} -p ${APP_PORT}:3000 --env-file .env ${IMAGE_NAME}"
            }
        }
    }
}
