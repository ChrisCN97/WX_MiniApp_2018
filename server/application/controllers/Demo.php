<?php
defined('BASEPATH') OR exit('No direct script access allowed');
header("content-type:text/html;charset=utf-8"); 

class Demo extends CI_Controller {
    public function index() {
        $sql=mysqli_connect('localhost','root','my834499591','cAuth','3306');
        mysqli_set_charset($sql,"utf8");
        $sql_command='select * from activityInfo';
        $stmt=mysqli_prepare($sql,$sql_command);
        mysqli_stmt_execute($stmt);
        $result=mysqli_stmt_get_result($stmt);
       // $result=mysqli_query($sql_command);
        $row=mysqli_fetch_all($result,MYSQLI_ASSOC);
        $counts=count($row,0);
        for($x=0;$x<$counts;$x++)
        {
          $row[$x]['remark']=explode(',',$row[$x]['remark']);
        }
        echo json_encode($row);
        
    }
}
