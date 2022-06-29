# Bootcamp Bitirme Projesi


## Eren Yiğit


### Bu repo Airties Cloud: AWS & DevOps Bootcamp'inin bitirme ödevi için hazırlanmıştır.

![Network Diagram](https://i.ibb.co/nMkRRgb/bootcamp-project-structure.png)

## Features

Repo, Common Stack olan Public Subnet, Private Subnet ve Nat Gateway içeren stack'i ve AWS ECS Fargate Stackinin içermektedir.
Stackler CDK yardımıyla yaratılmıştır.

### Common Stack 
10.0.0.0/16 CIDR bloğuna sahip 2 Availibity Zone da yer alan 2'şer adet private ve public subnet ve 
1 adet NAT Gateway içeren VPC Network'ünü içermektedir.

### AWS ECS Fargate Stack
Bu stack, bir adet Express.js backend API'ı içeren konteynırın barındığı ECR Stack'i.
80 ve 443 portlarına security groupunda inbound rule olarak sahip bir ECS Cluster Stack'i.
SSM'den parametre okuyabilme yetkisine sahip, 1 CPU ve max 2 GB Ram kullanan 8080 portunda çalışan bir fargate servisine sahip.
Fargate servisi SSM'den DB_PASSWORD, JWT Secret ve DB_URL parametrelerini okumakta.
Servis iki adet Taskta çalışmakta. 1 ve 4 adet task arasında request sayısına bağlı olarak downscale ve upscale olmaktadır.
Elastic Load Balancing yardımı ile HTTP(80) portu üzerinden gönderilen istekler otomatik olarak HTTPS(443) portuna yönlendirilmektedir.
Servis Route 53 yardımı ile bootcampproject.erenyigit.com üzerinden dış dünyaya açılmakta ve AWS Certificate Manager yardımı ile güvenli bağlantı sunmaktadır.

Koşmakta olan uygulamaya bootcampproject.erenyigit.com/signup üzerinden "email" ve "password" parametreleri yollandıktan sonra üye olunup
Sonrasında bootcampproject.erenyigit.com/signin endpointi aracılığı ile yine aynı parametreler kullanılarak bootcampproject.erenyigit.com/api/<resource>
korunan endpointler kullanılabilir.


