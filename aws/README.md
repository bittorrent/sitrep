Deploying to AWS
==

A stack is provided to simplify the creation of a robust, yet cost-effective, multi-AZ deployment.


* Initialize a new CloudFormation stack using cluster.template. Keep the service offline for now.

  The stack will create the following:

    * A cluster of [ECS](https://aws.amazon.com/ecs/) instances, which runs the application. These instances have the SSM agent installed, so they can be accessed via [Run Command](https://aws.amazon.com/ec2/run-command/) if needed.

    * An [Elastic Load Balancer](https://aws.amazon.com/elasticloadbalancing/), which distributes traffic to the ECS instances.

    * A [CloudFront](https://aws.amazon.com/cloudfront/) distribution, which acts as a CDN. A lambda function will be created to synchronize the load balancer's security group with CloudFront's IP ranges.

    * A [Route 53](https://aws.amazon.com/route53/) record to associate your domain name with the server.

    * An [S3](https://aws.amazon.com/s3/) bucket and [EFS](https://aws.amazon.com/efs/) volume to store your configuration. The EFS volume is mounted to */mnt/efs* on the cluster instances.

    * An [RDS](https://aws.amazon.com/rds/) database to store persistent application data. This will be a MySQL database named *app*, with the master user name *root* and a password of your choosing.

    * A [CloudWatch](https://aws.amazon.com/cloudwatch/) log group where application logs will be sent.

  The creation of these resources will take a while (up to an hour, because CloudFront and RDS are slow).


* Write your configuration to a file named *config/settings.json* on the EFS volume. Currently, the easiest way to do this is to SSH into an instance and mount the volume. We'll make improve on this part of the process in the future if Amazon doesn't.


* Ensure that your database schema is up-to-date by running the required migrations.

  * The stack creates a *CommandTaskDefinition* resource that can be used to execute application commands. Run the task once with the command override of `db,upgrade`, and verify that the command executed successfully by viewing the logs in CloudWatch.


* Whitelist CloudFront's IP addresses.

  * The stack creates a *SecurityGroupUpdateFunction* resource that keeps the load balancer's security group up-to-date. You'll need to manually run it once, after initializing the stack, but after that, it will automatically execute when needed. To manually run it, you can use any test data (i.e. the default Hello World data is fine).


* Edit the stack to bring the service online.

  * Just switch the *ServiceState* parameter to *Online*.
