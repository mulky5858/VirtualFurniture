var mouseon=0;
var wait=3000;
var informationcount=0;
function information(num)
{

mouseon=1;
informationcount++;       
thingsinformationOut(informationcount);

document.getElementById("thingsinformation").style.display='block';	
document.getElementById("thingsinformation").style.opacity=1;	
document.getElementById("thingsinformationText").style.display='block';	
document.getElementById("thingsinformationText").style.opacity=1;
var str;
switch(num)
		{
		case 0:
		str="一盏灯，这盏灯是第一个入住到本系统的客户。";
		break;
		case 1:
		str="一张能坐三个人的沙发，当然坐四个人问题也应该不大。";
		break;
		case 2:
		str="真正的背投彩电哦，目前有"+numofTVchannel+"个频道正在热播当中。";
		break;
		case 3:
		str="木质的茶几，一般被放在客厅当中。注意：不要站人";
		break;
		case 4:
		str="书架、陈列架、杂物架，可以放各种物品的架子。";
		break;
		case 5:
		str="就是个花瓶，你以为还会有别的啥么？";
		break;
		case 6:
		str="一个看似很古老的茶壶，据说是从某个地摊上购得的。";
		break;
		case 7:
		str="由于年久失修，这台空调似乎无法制冷了。";
		break;
		case 8:
		str="里面有蟑螂！";
		break;
		case 9:
		str="幸福的发源地。";
		break;
		case 10:
		str="这种柜子一般放在床的旁边，谁让他叫”床头柜“呢~";
		break;
		case 11:
		str="往下按是开灯，往上按是关灯。哦，不，我也忘了。";
		break;
		case 12:
		str="对不起，您拨打的电话暂时无人接听，请稍后再拨。";
		break;
		case 13:
		str="没插电源。你说插座在哪？鬼才知道。";
		break;
		case 14:
		str="这个桌子散发出一股淡淡的檀木香。";
		break;
		case 15:
		str="易碎物品~";
		break;
		case 16:
		str="只有傻瓜才以为这个床没有床板。";
		break;
		case 17:
		str="一匹半，对于这么大的一个房间，它有点力不从心。";
		break;
		case 18:
		str="ZL，我爱你。";
		break;
		case 19:
		str="它曾经是棵参天大树。";
		break;
		case 20:
		str="请把你的鞋子放进去。OMG,真是太臭了。";
		break;
		case 21:
		str="真的只能坐一个人哦。";
		break;
		case 22:
		str="你可以躺在上面睡觉，那会很舒服。";
		break;
		case 23:
		str="橘子牌。";
		break;
		case 24:
		str="塑料椅子，超重者请勿尝试。";
		break;
		case 25:
		str="曾经有个超重的人坐在我上面，结果...我活了下来。";
		break;
		case 26:
		str="还没被人坐过。";
		break;
		case 27:
		str="油漆味好重。";
		break;
		case 28:
		str="用来放一些日常用品的精致柜子。";
		break;
		case 29:
		str="我是花瓶我怕谁？";
		break;
		case 30:
		str="价值1元。";
		break;
		case 31:
		str="价值10元。";
		break;
		case 32:
		str="价值连城。";
		break;
		case 33:
		str="这真的是几本书啦！";
		break;
		case 34:
		str="我家是我家，整洁靠大家。";
		break;
		case 35:
		str="什么，你居然能点到我，我在异次元空间啊！";
		break;
		case 36:
		str="便宜货。";
		break;
		case 37:
		str="里面记录着曾经的点点滴滴。";
		break;
		case 38:
		str="需要用C4炸弹才能炸开~";
		break;
		}
document.getElementById("thingsinformationText").textContent=str;		

}

function hideinformation()
{
var opa=parseFloat(document.getElementById("thingsinformation").style.opacity);
opa-=0.0625;
document.getElementById("thingsinformation").style.opacity= opa;
document.getElementById("thingsinformationText").style.opacity= opa;


if (mouseon) 
{
	 document.getElementById("thingsinformation").style.opacity=1;		
	 document.getElementById("thingsinformationText").style.opacity=1;	
}
else {
		if(opa>0){
					setTimeout(function(){hideinformation()},62.5);					
				 }
		else
		{
		document.getElementById("thingsinformation").style.display='none';	
		document.getElementById("thingsinformationText").style.display='none';	
		}

    }
	
}

function thingsinformationOver()
{
mouseon=1;
informationcount++;  
}

function thingsinformationTextOver()
{
mouseon=1;
}


function thingsinformationOut(num)
{
setTimeout("if (informationcount=="+num+"){mouseon=0;hideinformation();}",wait); 	
}

