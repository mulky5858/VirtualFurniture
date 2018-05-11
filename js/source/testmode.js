var testmode=0;  
//1代表开启测试模式
//0为关闭测试模式
var testoutput="碰撞体积开启。";

function testmodeonload()
{
  testmode=1;  	
  	
}
function testmodeclose()
{
  testmode=0;  
  CharacterReset();
  testoutput="碰撞体积开启。";

	
}




function clicked(num)
{
switch(num)
{	
case 0:
return "吊灯1";
break;
case 1:
return "多人沙发";
break;
case 2:
return "背投彩电";
break;
case 3:
return "椭圆茶几";
break;
case 4:
return "书架";
break;
case 5:
return "花瓶1";
break;
case 6:
return "茶壶";
break;
case 7:
return "立式空调";
break;
case 8:
return "衣柜";
break;
case 9:
return "双人床";
break;
case 10:
return "床头柜";
break;
case 11:
return "开关";
break;
case 12:
return "电话机";
break;
case 13:
return "台式电脑";
break;
case 14:
return "办公桌1";
break;
case 15:
return "吊灯2";
break;
case 16:
return "木床";
break;
case 17:
return "挂式空调";
break;
case 18:
return "中央空调";
break;
case 19:
return "方形茶几";
break;
case 20:
return "鞋柜";
break;
case 21:
return "单人沙发";
break;
case 22:
return "双人沙发";
break;
case 23:
return "笔记本电脑";
break;
case 24:
return "椅子1";
break;
case 25:
return "椅子2";
break;
case 26:
return "椅子3";
break;
case 27:
return "衣柜2";
break;
case 28:
return "酒柜";
break;
case 29:
return "花瓶2";
break;
case 30:
return "装饰品1";
break;
case 31:
return "装饰品2";
break;
case 32:
return "装饰品3";
break;
case 33:
return "书本";
break;
case 34:
return "垃圾桶";
break;
case 35:
return "圆桌";
break;
case 36:
return "办公桌2";
break;
case 37:
return "相框";
break;
case 38:
return "门";
break;
}
}