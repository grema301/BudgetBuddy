drop table if exists User;
drop table if exists Supermarket;
drop table if exists Product;
drop table if exists Category;


create table User(
    user_id INT not null AUTO_INCREMENT,
    first_name varchar(250) not null,
    last_name varchar(250) not null,
    password varchar(250) not null,
    email_address varchar(250) not null,
    home_address varchar(250),
    constraint user_pk primary key (user_id)
);

create table Supermarket(
    supermarket_name varchar(250) not null,
    address varchar(250) not null,
    constraint supermarket_pk primary key (supermarket_name)
);

create table Category(
    category_name varchar(250) not null,
    constraint category_pk primary key (category_name)
);

create table Product(
    product_id INT not null AUTO_INCREMENT,
    category_name varchar(250) not null,
    name varchar(250) not null,
    price DECIMAL(10,2) not null,
    image_url varchar(250) not null,
    supermarket_name varchar(250) not null,
    constraint product_pk primary key (product_id),
    constraint product_fk foreign key (category_name) references Category(category_name)
);