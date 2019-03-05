<?php
defined('BASEPATH') OR exit('No direct script access allowed');
header("content-type:text/html;charset=utf-8"); 

class Uplike extends CI_Controller {
    public function index() {
        $likeId=$_GET['likeId'];
        $skey=$_GET['skey'];
        
        $sql=mysqli_connect('localhost','root','my834499591','cAuth','3306');
        mysqli_set_charset($sql,"utf8");
        $sql_command='update cSessionInfo SET likeId = ? where skey = ?';
        $stmt=mysqli_prepare($sql,$sql_command);
        mysqli_stmt_bind_param($stmt,"ss",$likeId,$skey);
        mysqli_stmt_execute($stmt);
    }
}
