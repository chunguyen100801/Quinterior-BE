pipeline {
    agent any
    environment {
        PORTAINER_URL = credentials('portainer-url')
        PORTAINER_API_TOKEN = credentials('portainer-api-token')
        PORTAINER_ENDPOINT = credentials('portainer-endpoint')
        STACK_ID = 2
        DOCKER_ACCESS_TOKEN = credentials('docker-access-token')
        SHORT_COMMIT="${GIT_COMMIT[0..7]}"
    }
    stages {
        stage('Checkout') {
            steps {
                script {
                    checkout scm
                    notifyBitbucket()
                    bitbucketStatusNotify(buildState: 'INPROGRESS')
                }
            }
        }
        stage('Deploy') {
            when {
                anyOf {
                    branch 'master'
                }
            }
            steps {
                script{
                    try{
                        sh """
                            bash apps/api/deploy/deploy.sh ${env.PORTAINER_URL} ${env.PORTAINER_API_TOKEN} ${env.PORTAINER_ENDPOINT} ${env.STACK_ID} ${env.DOCKER_ACCESS_TOKEN} ${env.SHORT_COMMIT}
                        """
                        currentBuild.result = 'SUCCESS'
                    } catch (Exception e) {
                        currentBuild.result = 'FAILURE'
                        def errorMessage = currentBuild.rawBuild.getLog(30).join('\n')
                        bitbucketStatusNotify(buildState: 'FAILED', buildDescription: "Error message: ${errorMessage}")
                        error("Stage failed with error: ${e}")
                    }
                }
            }
        }
    }
    post {
        always {
            script {
                currentBuild.result = currentBuild.result ?: 'SUCCESS'
                if (currentBuild.result != 'FAILURE') {
                    bitbucketStatusNotify(buildState: 'SUCCESSFUL')
                } else {
                    bitbucketStatusNotify(buildState: 'FAILED')
                }
                notifyBitbucket()
                cleanWs()
            }
        }
    }
}
