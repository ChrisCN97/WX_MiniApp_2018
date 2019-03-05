<?php
defined('BASEPATH') OR exit('No direct script access allowed');
header("content-type:text/html;charset=utf-8"); 
use \QCloud_WeApp_SDK\AUTH\AuthAPI as Auth;

class Getauth extends CI_Controller {
    public function index() {
      $skey=$_GET['uskey'];
    
        $sql=mysqli_connect('localhost','root','my834499591','cAuth','3306');
        mysqli_set_charset($sql,"utf8");
        $sql_command='select auth_num from cSessionInfo where skey = ?';
        
        $stmt=mysqli_prepare($sql,$sql_command);
        mysqli_stmt_bind_param($stmt,"s",$skey);
        mysqli_stmt_execute($stmt);
        $result=mysqli_stmt_get_result($stmt);
       // $result=mysqli_query($sql_command);
        $row=mysqli_fetch_assoc($result);


        echo json_encode($row);
        
    }
}
