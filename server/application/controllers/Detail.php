<?php
defined('BASEPATH') OR exit('No direct script access allowed');
header("content-type:text/html;charset=utf-8"); 

class Detail extends CI_Controller {
    public function index() {
        $id=$_GET['aid'];
        $sql=mysqli_connect('localhost','root','my834499591','cAuth','3306');
        mysqli_set_charset($sql,"utf8");
        $sql_command='select * from details where id = ?';
        $stmt=mysqli_prepare($sql,$sql_command);
        mysqli_stmt_bind_param($stmt,"i",$id);
        mysqli_stmt_execute($stmt);
        $result=mysqli_stmt_get_result($stmt);
       // $result=mysqli_query($sql_command);
        $row=mysqli_fetch_assoc($result);
        
        
        $row['remarkDetail']=explode(',',$row['remarkDetail']);
        
        echo json_encode($row);
        
    }
}
