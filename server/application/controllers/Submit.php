<?php
defined('BASEPATH') OR exit('No direct script access allowed');
header("content-type:text/html;charset=utf-8"); 
use \QCloud_WeApp_SDK\AUTH\AuthAPI as Auth;

class Submit extends CI_Controller {
    public function index() {
        $id=$_GET['aid'];
        $name=$_GET['name'];
        $time=$_GET['time'];
        $location=$_GET['location'];
        $remark=$_GET['remark'];
        $host=$_GET['host'];
        $detail=$_GET['detail'];
        $sql=mysqli_connect('localhost','root','my834499591','cAuth','3306');
        mysqli_set_charset($sql,"utf8");
        $sql_command='insert into activityInfo (id,name,time,location,remark) values (?,?,?,?,?)';        
        $stmt=mysqli_prepare($sql,$sql_command);
        mysqli_stmt_bind_param($stmt,"issss",$id,$name,$time,$location,$remark);
        mysqli_stmt_execute($stmt);
        $sql_command2='insert into details (id,host,detail) values (?,?,?)';
        $stmt=mysqli_prepare($sql,$sql_command);
        mysqli_stmt_bind_param($stmt,"iss",$id,$host,$detail);
        mysqli_stmt_execute($stmt);
        
        
    }
}
