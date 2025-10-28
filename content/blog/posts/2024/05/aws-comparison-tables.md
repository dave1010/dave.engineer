---
title: "AWS Service Comparison and Cheat Sheet"
date: 2024-05-20
tags:
  - aws
type: til
---
*Note: these were created primarily with ChatGPT, Claude and Gemini, with a bit of back and forth prompting, pasting in AWS docs and correcting things.*

## AWS main topology and infrastructure options


| **Feature**           | **AWS Regions**                                                                 | **AWS Local Zones**                                                                     | **AWS Edge Locations**                                                        | **AWS Wavelength**                                                           | **AWS Outposts**                                                             |
|-----------------------|---------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|------------------------------------------------------------------------------|------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| **Scope**             | Geographically distinct locations with multiple Availability Zones              | Extensions of Regions in metro areas                                                    | Global locations for content delivery and caching                            | Integrated with telecom providers' 5G networks                               | AWS infrastructure deployed on-premises                                      |
| **Purpose**           | General-purpose, high availability, fault tolerance, disaster recovery          | Low-latency access to a subset of AWS services in metro areas                           | Improve web application performance through caching                          | Ultra-low latency and high-bandwidth for 5G applications                     | Consistent hybrid experience and local processing                            |
| **Latency**           | Varies, typically higher compared to Local Zones and Wavelength                  | Lower latency compared to Regions                                                       | Ultra-low latency for cached content                                         | Lowest possible latency by being embedded within the 5G network              | Low latency for on-premises applications                                     |
| **Primary Use**       | Broad spectrum of applications, data storage, backups                           | Latency-sensitive applications like real-time gaming, live streaming, AR/VR             | Content delivery, web application performance                                | Real-time applications requiring ultra-low latency and high bandwidth        | Applications requiring local processing, data residency, and low-latency     |
| **Services**          | Full range of AWS services                                                      | Subset of AWS services                                                                  | CloudFront, AWS Global Accelerator, AWS WAF, Lambda@Edge                     | Subset of AWS services (e.g., EC2, EBS, VPC)                                  | Full range of AWS services available on-premises                             |
| **Examples**          | US East (N. Virginia), EU (Frankfurt), Asia Pacific (Tokyo)                     | Los Angeles, Boston, Miami                                                              | Over 400 locations globally                                                  | Cities with 5G coverage through telecom partners like Verizon, Vodafone      | Customer data centers, edge locations, remote facilities                     |
| **Connectivity**      | Standard AWS global network                                                     | Connected to the nearest AWS Region                                                     | Part of AWS global network                                                   | Directly connected to telecom providers’ 5G networks                         | Connected to AWS Regions for hybrid workloads                                |


## AWS Networking Topology, Firewalls and Routing


| **Feature**                  | **VPC (Virtual Private Cloud)**                                      | **Security Groups**                                                     | **Network ACLs (Access Control Lists)**                                     | **Route Tables**                                                        | **Internet Gateway**                                                   | **NAT Gateway**                                                       | **Transit Gateway**                                                   | **AWS WAF (Web Application Firewall)**                                 |
|------------------------------|---------------------------------------------------------------------|------------------------------------------------------------------------|----------------------------------------------------------------------------|------------------------------------------------------------------------|------------------------------------------------------------------------|------------------------------------------------------------------------|------------------------------------------------------------------------|------------------------------------------------------------------------|
| **Scope**                    | Isolated section of AWS Cloud                                       | Instance-level firewall                                                | Subnet-level firewall                                                      | Controls routing of traffic within VPC                                  | Connects VPC to the internet                                           | Enables outbound internet traffic for instances in private subnets    | Connects multiple VPCs and on-premises networks                        | Protects web applications from common web exploits                     |
| **Purpose**                  | Define a virtual network logically isolated from other AWS resources | Control inbound/outbound traffic for instances                          | Control inbound/outbound traffic for subnets                               | Manage routes between subnets and to external destinations              | Allow resources in a VPC to access the internet                         | Allow private subnet resources to access the internet                  | Simplify network architecture with centralized connectivity             | Protect against web exploits like SQL injection and cross-site scripting |
| **Granularity**              | Network-wide                                                         | Instance-level                                                          | Subnet-level                                                               | VPC/subnet-level                                                       | VPC-level                                                               | Subnet-level                                                           | VPC and network-wide                                                   | Application-level                                                     |
| **Stateful/Stateless**       | N/A                                                                  | Stateful                                                               | Stateless                                                                  | N/A                                                                     | N/A                                                                     | N/A                                                                     | N/A                                                                     | Stateful                                                               |
| **Traffic Direction**        | Inbound and outbound                                                | Inbound and outbound                                                   | Inbound and outbound                                                       | Inbound and outbound                                                   | Outbound only                                                           | Outbound only                                                          | Inbound and outbound                                                   | Inbound and outbound                                                  |
| **Default Behavior**         | Isolated network, no traffic allowed by default                     | Deny all inbound, allow all outbound by default                        | Allow all inbound and outbound by default                                  | Allow routing within VPC, explicit routes needed for external traffic   | No traffic allowed by default                                           | No traffic allowed by default                                          | No connectivity by default                                             | No protection by default                                               |
| **Rules**                    | Define CIDR blocks, subnets, route tables                           | Allow rules based on IP addresses, port numbers, protocols             | Allow and deny rules based on IP addresses, port numbers, protocols        | Define routes based on IP address ranges and targets                    | N/A                                                                     | N/A                                                                     | N/A                                                                     | Rules to allow or block specific HTTP/S requests                        |
| **Use Cases**                | Customizable network topology, security, and management             | Protect instances from unwanted traffic                                | Additional layer of security at the subnet level                           | Direct traffic within VPC and to/from external networks                 | Provide internet access to VPC resources                                | Provide internet access to private subnets                             | Simplify and manage complex network topologies                         | Protect web applications from malicious attacks                         |
| **Examples**                 | Create VPC with public and private subnets                           | Configure Security Groups to allow SSH traffic on port 22               | Set up Network ACL to allow HTTP traffic on port 80                        | Route traffic between public subnet and internet                         | Attach Internet Gateway to VPC                                          | Deploy NAT Gateway in public subnet for private subnet access           | Connect multiple VPCs across regions for centralized control           | Apply WAF rules to protect against OWASP Top 10 vulnerabilities         |
| **Integration**              | Integrated with other AWS services like EC2, RDS, Lambda, etc.       | Works with EC2 instances, ELB, RDS                                      | Works with VPC subnets, integrated with CloudTrail for logging             | Integrated with VPC, subnets, Internet/NAT Gateways                     | Integrated with VPC and Route Tables                                    | Integrated with VPC, Route Tables, and Security Groups                 | Integrated with VPCs, Direct Connect, and VPNs                          | Integrated with CloudFront, API Gateway, ALB, and Route 53              |


# AWS Storage Services

| **Feature**                  | **S3 (Simple Storage Service)**                        | **EBS (Elastic Block Store)**                   | **EFS (Elastic File System)**                   | **Glacier**                                   | **FSx**                                          | **EC2 Instance Store**                         | **AWS Storage Gateway**                       | **AWS File Cache**                            |
|------------------------------|--------------------------------------------------------|-------------------------------------------------|------------------------------------------------|------------------------------------------------|------------------------------------------------|------------------------------------------------|------------------------------------------------|------------------------------------------------|
| **Scope**                    | Object storage                                         | Block storage for EC2 instances                 | File storage                                   | Archival storage                               | Managed file systems (Windows, Lustre, etc.)   | Ephemeral block storage for EC2 instances     | Hybrid cloud storage                           | Caching for high-performance applications     |
| **Purpose**                  | Store and retrieve any amount of data                  | Persistent block storage for EC2 instances       | Scalable file storage for multiple instances    | Long-term data archiving                       | Specialized file systems for specific use cases | Temporary storage for high I/O operations     | Integrate on-premises environments with AWS    | Cache frequently accessed data for low latency |
| **Data Access**              | HTTP/S, REST API                                       | Attached to EC2 instances as volumes             | NFS (Network File System)                       | REST API, SDK                                  | NFS (Lustre), SMB (Windows)                    | Directly attached to EC2 instances             | NFS, SMB, iSCSI                               | NFS, SMB                                      |
| **Durability**               | 99.999999999% (11 9's)                                 | 99.999%                                          | 99.999999999%                                   | 99.999999999%                                  | 99.999999999% (varies by FSx type)             | Data persists only during instance life        | Varies by configuration                       | 99.999999999%                                 |
| **Availability**             | 99.99% - 99.999999999%                                 | 99.99%                                           | 99.99%                                          | 99.99%                                          | 99.99% (varies by FSx type)                    | Data persists only during instance life        | Varies by configuration                       | 99.99%                                        |
| **Scalability**              | Virtually unlimited                                    | Up to 64 TiB per volume                         | Virtually unlimited                             | Virtually unlimited                            | Up to petabytes                                | Limited to instance type                      | Scale up by adding more gateways              | Scale by adding more cache nodes              |
| **Performance**              | High throughput, low latency                          | High IOPS, low latency                          | Scalable throughput and IOPS                    | Varies (low retrieval times for expedited)     | High performance (varies by FSx type)          | High IOPS, low latency                        | Dependent on network and configuration        | High performance, low latency                 |
| **Use Cases**                | Backup, archival, data lakes, big data analytics      | Databases, file systems, applications           | Big data and analytics, content management      | Long-term backups, regulatory archives         | HPC, big data analytics, Windows applications  | Caching, temporary data processing             | Backup and restore, file sharing, disaster recovery | High-speed caching for data-intensive applications |
| **Pricing**                  | Pay-as-you-go, based on storage used                   | Pay-as-you-go, based on provisioned storage     | Pay-as-you-go, based on storage used            | Pay-as-you-go, based on storage and retrieval  | Pay-as-you-go, based on provisioned storage    | Included in EC2 instance cost                 | Pay-as-you-go, based on gateway and usage     | Pay-as-you-go, based on provisioned cache     |
| **Integration**              | Integrated with many AWS services (Lambda, Athena)     | Integrated with EC2                             | Integrated with EC2, ECS, Lambda                | Integrated with S3 for archival                | Integrated with EC2, Direct Connect            | Integrated with EC2                            | Integrated with on-premises infrastructure    | Integrated with AWS storage services          |
| **Management**               | Managed by AWS                                         | Managed by AWS                                  | Managed by AWS                                  | Managed by AWS                                 | Managed by AWS                                  | User-managed                                   | Managed by AWS, with on-premises deployment   | Managed by AWS                                |
| **Examples**                 | Storing images, videos, backups, logs                  | Running databases, ERP systems                  | Shared file storage for web serving, CMS        | Archiving financial and healthcare records     | FSx for Windows (file storage), FSx for Lustre (HPC) | High-performance storage for temporary data  | File Gateway for NFS/SMB, Tape Gateway        | Caching frequently accessed data for HPC      |

## AWS Database Services


| **Feature**           | **Amazon RDS**                                                                 | **Amazon DynamoDB**                                                                   | **Amazon Aurora**                                                             | **Amazon Redshift**                                                          | **Amazon ElastiCache**                                                      | **Amazon MemoryDB for Redis**                                              | **Amazon DocumentDB**                                                      | **Amazon Keyspaces**                                                       | **Amazon Neptune**                                                          | **Amazon Timestream**                                                      | **Amazon Quantum Ledger Database (QLDB)**                                  |
|-----------------------|--------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|------------------------------------------------------------------------------|------------------------------------------------------------------------------|------------------------------------------------------------------------------|------------------------------------------------------------------------------|------------------------------------------------------------------------------|------------------------------------------------------------------------------|------------------------------------------------------------------------------|------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| **Database Type**     | Relational                                                                     | NoSQL (Key-Value and Document)                                                        | Relational                                                                    | Data Warehouse                                                               | In-memory cache and store                                                   | Managed Redis-compatible in-memory database                                | Managed MongoDB-compatible document database                                | Managed Cassandra-compatible database                                       | Managed graph database                                                      | Time series                                                                 | Ledger database                                                            |
| **Purpose**           | Traditional relational databases                                               | High-performance, scalable NoSQL                                                      | MySQL and PostgreSQL compatibility with added performance                    | Analytical queries and large-scale data processing                           | Accelerate database queries, caching                                        | Low-latency, Redis-compatible caching                                        | MongoDB workloads                                                           | Cassandra workloads                                                         | Relationship and graph-based queries                                        | Store and analyze time series data                                          | Immutable, cryptographically verifiable ledger                             |
| **Use Cases**         | OLTP applications, transactional data                                          | Applications requiring consistent, single-digit millisecond latency at any scale      | High throughput and availability for relational workloads                    | Complex analytical queries, big data                                        | Speed up read-heavy applications, session stores                            | Real-time bidding, session caching, leaderboards                            | Content management, catalogs, user profiles                                 | IoT, messaging, gaming applications                                         | Social networks, recommendation engines, fraud detection                    | IoT applications, operational monitoring                                    | Supply chain, finance, health records                                      |
| **Data Model**        | Tables, rows, and columns                                                      | Tables with items (key-value pairs) and attributes                                    | Tables, rows, and columns                                                    | Tables with rows and columns                                                 | Key-value store                                                             | Key-value store                                                             | Collections, documents (JSON)                                               | Tables with rows and columns                                                | Property graphs (nodes and edges)                                           | Tables with rows and columns                                                | Tables with rows and columns                                                |
| **Scalability**       | Vertical and horizontal scaling                                                | Fully managed, automatic scaling                                                      | Auto-scaling, serverless options                                             | Scalable compute nodes and storage                                           | Cluster mode for sharding                                                   | Scalable through clustering                                                 | Auto-scaling storage                                                        | Scalable throughput and storage                                             | Scale out with read replicas                                                | Auto-scaling, serverless                                                   | Scales with ledger size                                                    |
| **Performance**       | High performance with provisioned IOPS                                         | Single-digit millisecond response times                                               | High performance with up to 5x throughput of standard MySQL                  | High performance for analytical queries                                      | Low latency                                                                  | Microsecond read and write latencies                                        | Millisecond read and write latencies                                        | Millisecond latency                                                         | Millisecond latency                                                         | High ingestion rates and query performance                                  | High throughput                                                             |
| **Availability**      | Multi-AZ deployments for high availability                                     | Global tables for multi-region and high availability                                  | Multi-AZ, cross-region replication                                           | Multi-AZ, fault-tolerant                                                     | Multi-AZ clusters                                                           | Multi-AZ replication                                                        | Multi-AZ, continuous backups                                                | Multi-AZ replication                                                        | Multi-AZ replication                                                        | Multi-AZ replication                                                        | Built-in multi-region availability                                          |
| **Management**        | Fully managed, automatic backups, patching, and updates                        | Fully managed, on-demand backup and restore                                           | Fully managed, automatic backups, patching, and updates                      | Fully managed, automatic backups, patching, and updates                      | Fully managed, automatic backups, patching, and updates                      | Fully managed, automatic backups, patching, and updates                     | Fully managed, automatic backups, patching, and updates                     | Fully managed, automatic backups, patching, and updates                     | Fully managed, automatic backups, patching, and updates                     | Fully managed, automatic backups, patching, and updates                     | Fully managed, automatic backups, patching, and updates                     |
| **Pricing**           | Pay-as-you-go, reserved instances                                              | Pay-as-you-go, provisioned throughput                                                | Pay-as-you-go, reserved instances                                            | Pay-as-you-go, reserved instances                                            | Pay-as-you-go, reserved nodes                                                | Pay-as-you-go, reserved instances                                           | Pay-as-you-go, reserved instances                                           | Pay-as-you-go, reserved instances                                           | Pay-as-you-go, reserved instances                                           | Pay-as-you-go, reserved instances                                           | Pay-as-you-go, reserved instances                                           |
| **Examples**          | MySQL, PostgreSQL, MariaDB, Oracle, SQL Server                                 | Key-value stores, gaming leaderboards, mobile apps                                    | MySQL, PostgreSQL, Serverless, Global Databases                              | Business intelligence, complex queries                                       | Session storage, leaderboard, caching                                       | Gaming, financial services, health care applications                        | Content management systems, catalogs, user profiles                         | IoT applications, messaging, gaming applications                            | Social networks, recommendation engines, fraud detection                    | IoT sensor data, financial trading, operational monitoring                   | Supply chain tracking, financial systems, healthcare records                |

 
## AWS Compute Services:

| **Feature** | **EC2** | **Lambda** | **Fargate** | **ECS** | **EKS** | **Lightsail** |
|--------------|----------|------------|--------------|----------|----------|-----------------|
| **Service Type** | Virtual Machines | Serverless Functions | Serverless Containers | Container Orchestration | Kubernetes Service | Virtual Private Server |
| **Pricing Model** | Pay per use (instance type, uptime) | Pay per use (invocations, duration) | Pay per use (vCPU, memory) | Pay per use (EC2 instances or Fargate) | Pay per use (EC2 instances, Fargate) | Fixed monthly plans |
| **Compute Capacity** | Configurable (instance types) | Automatically scales | Configurable (vCPU, memory) | Configurable (instances, tasks) | Configurable (nodes, pods) | Fixed options (plans) |
| **Operational Responsibility** | Server management (patching, scaling) | Fully managed | Cluster management | Cluster management | Cluster management | Fully managed |
| **Deployment Model** | Virtual Machines | Functions (code) | Containers | Containers | Containers | Virtual Machines |
| **Orchestration** | Manual or third-party tools | Fully managed | ECS or EKS | ECS | EKS | Manual or third-party tools |
| **Primary Use Case** | Long-running applications, monoliths | Event-driven, short-lived tasks | Microservices, batch jobs | Containerized applications | Containerized applications, microservices | Simple web apps, blogs, websites |
| **Integration** | Wide range of AWS services | Integrates with many AWS services | Integrates with other AWS services | Integrates with other AWS services | Integrates with other AWS services | Fewer integrations |
| **Scalability** | Vertical (instance types), Horizontal (Auto Scaling) | Automatically scales | Horizontal scaling | Horizontal scaling | Horizontal scaling | Vertical scaling (plan changes) |
| **Container Support** | Yes (with Docker or other tools) | No | Yes (managed containers) | Yes | Yes | Limited |



## EC2 instance types

| **Instance Type** | **On-Demand** | **Reserved** | **Spot** | **Dedicated Hosts** | **Dedicated Instances** | **Capacity Reserved** |
|-------------------|----------------|---------------|-----------|--------------------|-------------------------|------------------------|
| **Pricing** | Pay per second, no upfront cost | Upfront payment for a term, hourly usage fee | Bid-based, fluctuating price | Per-host billing, hourly rate | Per-instance billing, hourly rate | Upfront payment, hourly usage fee |
| **Cost Savings** | - | Up to 72% discount | Up to 90% discount | - | - | Discount over On-Demand |
| **Instance Availability** | Available as needed | Reserved capacity | Opportunistic, can be interrupted | Dedicated physical servers | Dedicated physical server capacity | Reserved capacity |
| **Use Case** | Short-term, unpredictable workloads | Steady-state, predictable usage | Fault-tolerant, flexible workloads | Compliance, licensing, legacy apps | Compliance, licensing requirements | Predictable usage |
| **Term Commitment** | None | 1 or 3 years | None | 3 years | None | 1 or 3 years |
| **Instance Types** | All | Specific | Varies, based on availability | Specific | Specific | Specific |


## AWS Services List

- **SageMaker**: Managed service for building, training, and deploying machine learning models.
- **Athena**: Query service for analyzing data in S3 using SQL.
- **Kinesis**: Real-time data streaming service.
- **Snowball**: Physical device for data transfer to and from AWS.
- **Macie**: Security service that uses machine learning to discover, classify, and protect sensitive data.
- **Glue**: Managed ETL service for preparing and transforming data.
- **Elastic Beanstalk**: Platform as a service for deploying and scaling web applications.
- **Fargate**: Serverless compute engine for containers.
- **Lambda**: Run code in response to events without provisioning servers.
- **Aurora**: High-performance, MySQL and PostgreSQL-compatible relational database.
- **Neptune**: Managed graph database service.
- **Lightsail**: Easy-to-use virtual private server with predictable pricing.
- **Greengrass**: Software for running local compute, messaging, and data caching for IoT devices.
- **Firehose**: Load streaming data into data lakes, warehouses, and analytics services.
- **Redshift**: Managed data warehouse service.
- **CloudFront**: Content delivery network (CDN) service.
- **Wavelength**: Brings AWS services to the edge of the 5G network.
- **Outposts**: Bring AWS infrastructure and services to on-premises locations.
- **AppStream**: Stream desktop applications to any device.
- **Chime**: Communication service for online meetings, video conferencing, and business calling.
- **WorkSpaces**: Managed, secure cloud desktop service.
- **Kendra**: Enterprise search service powered by machine learning.
- **Lex**: Build conversational interfaces using voice and text.
- **Polly**: Text-to-speech service.
- **Transcribe**: Automatic speech recognition (ASR) service.
- **Comprehend**: Natural language processing (NLP) service.
- **Rekognition**: Image and video analysis service.
- **Textract**: Extract text and data from scanned documents.
- **Elemental**: Video processing and delivery service.
- **Braket**: Quantum computing service.
- **QuickSight**: Business intelligence service for data visualization.
- **OpsWorks**: Configuration management service that uses Chef or Puppet.
- **CodePipeline**: Continuous integration and delivery service.
- **CodeBuild**: Fully managed build service.
- **CodeDeploy**: Automates code deployments to any instance.
- **CodeStar**: Unified user interface for managing software development activities.
- **AppRunner**: Deploy and run containerized web applications and APIs.
- **Step Functions**: Coordinate distributed applications using visual workflows.
- **Config**: Service to assess, audit, and evaluate the configurations of your AWS resources.
- **X-Ray**: Debug and analyze microservices applications.
- **Elastic Transcoder**: Media transcoding service.
- **Proton**: Automated management for container and serverless deployments.
- **AppFlow**: Managed integration service for SaaS apps.
- **Ground Station**: Fully managed service for satellite communications.
- **IoT Core**: Managed cloud service for connected devices.
- **IoT Greengrass**: Software to run local compute, messaging, and data caching for IoT devices.
- **IoT Analytics**: Analytics service for IoT data.
- **IoT Events**: Service for detecting and responding to events from IoT sensors.
- **IoT SiteWise**: Collect, store, organize, and monitor data from industrial equipment.
- **IoT Things Graph**: Service for building IoT applications with little or no code.
- **IoT TwinMaker**: Service to create digital twins of real-world systems.
- **Location Service**: Add location data to applications.
- **Panorama**: Computer vision at the edge.
- **Sumerian**: Create and run 3D, AR, and VR applications.
- **Glue DataBrew**: Visual data preparation tool.
- **EventBridge**: Serverless event bus for integrating applications.
- **Systems Manager**: Unified interface for operational data from AWS services.
- **Certificate Manager**: Provision, manage, and deploy SSL/TLS certificates.
- **Artifact**: Access compliance reports and agreements.
- **GuardDuty**: Threat detection service.
- **Detective**: Investigate security issues.
- **Security Hub**: Central security management service.
- **Shield**: DDoS protection service.
- **WAF**: Web application firewall.
- **Audit Manager**: Automates evidence collection for audits.
- **Control Tower**: Set up and govern a secure, compliant multi-account AWS environment.
- **Service Catalog**: Create and manage catalogs of IT services.
- **Well-Architected Tool**: Review and improve cloud architectures.
- **Personalize**: Real-time personalization and recommendation service.
- **Forecast**: Time-series forecasting service.
- **DeepComposer**: Machine learning-powered music composition.
- **DeepLens**: Deep learning-enabled video camera.
- **DeepRacer**: Autonomous 1/18th scale race car for reinforcement learning.
- **AWS Batch**: Run batch computing workloads.
- **Elastic File System (EFS)**: Scalable file storage service.
- **Elastic Load Balancing (ELB)**: Distributes incoming traffic across multiple targets.
- **FSx for Windows File Server**: Fully managed Windows file system.
- **FSx for Lustre**: High-performance file system integrated with S3.
- **S3 Glacier**: Low-cost cloud storage for data archiving and backup.
- **CloudFormation**: Infrastructure as code service.
- **CloudTrail**: Track user activity and API usage.
- **Elastic MapReduce (EMR)**: Managed Hadoop framework for processing big data.
- **Managed Streaming for Apache Kafka (MSK)**: Managed Apache Kafka service.
- **DataSync**: Automated data transfer service.
- **Snowcone**: Small, portable edge computing and data transfer device.
- **Snowmobile**: Exabyte-scale data transfer service.
- **App Mesh**: Service mesh for microservices.
- **Backup**: Centralized backup service.
- **CloudEndure Migration**: Simplify, expedite, and automate large-scale migration to AWS.
- **Database Migration Service (DMS)**: Migrate databases to AWS with minimal downtime.
- **Global Accelerator**: Improve availability and performance for global applications.
- **Snow Family**: Collective term for AWS Snowball, Snowcone, and Snowmobile devices.
- **WorkLink**: Secure mobile access to internal web content.
- **WorkDocs**: Secure document storage and sharing service.
