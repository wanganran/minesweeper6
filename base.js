/**
 * Mine Sweeper
 * Author:Wang Anran
 * Homepage:http://www.wanganran.com
 */
var data=new Array();
var Status=new Array();
var score=new Array(3);
var width,height;
var bombnum;
var msg;
var css3d;
var ticked=0;
var flags=0;
var time=0;
var started=false;
var firstclick=false;
var level;
var mouseStatus=1;
var clickingpoint;
var interval;

function LevelChanged(ele)
{
	if (ele.value != "leveln") {
		document.getElementById('txtheight').disabled = true;
		document.getElementById('txtwidth').disabled = true;
		document.getElementById('txtbombnum').disabled = true;
	}
	else {
		document.getElementById('txtheight').disabled = false;
		document.getElementById('txtwidth').disabled = false;
		document.getElementById('txtbombnum').disabled = false;
	}
	if (ele.value == "level1") {
		document.getElementById('txtheight').value = "10";
		document.getElementById('txtwidth').value = "10";
		document.getElementById('txtbombnum').value = "10";
	}
	if (ele.value == "level2") {
		document.getElementById('txtheight').value = "15";
		document.getElementById('txtwidth').value = "20";
		document.getElementById('txtbombnum').value = "50";
	}
	if (ele.value == "level3") {
		document.getElementById('txtheight').value = "20";
		document.getElementById('txtwidth').value = "30";
		document.getElementById('txtbombnum').value = "100";
	}
}
function GetScore(){
	var scorecollection = getCookie("minesweeperscore");
	
	if(!scorecollection){
		CreateScore();
		SaveScore();
		GetScore();
		return;
	}
	score=scorecollection.split("%%%");
	for (var l = 0; l < 3; l++) {
		var str=score[l];
		var s = str.split("%%");
		score[l]=new Array(3);
		for (var i = 0; i < 3; i++)
			score[l][i] = s[i].split("%");
	}
}
function CreateScore()
{
	score=new Array(3);
	
	for (i = 0; i < 3; i++) {
		score[i] = new Array(3);
		for (j = 0; j < 3; j++) {
			score[i][j] = new Array(2);
			score[i][j][0] = 9999;
			score[i][j][1] = "Anonymous";
		}
	}
}
function SaveScore()
{
	var cookie="";
	for (var l = 0; l < 3; l++) {
		for (var i = 0; i < 3; i++) 
			cookie += score[l][i][0] + "%" + score[l][i][1] + (i < 2 ? "%%" : "");
		if(l<2)cookie+="%%%";	
	}
	SetCookie("minesweeperscore",cookie);	
}
function ShowTable()
{
	var str="This is the top score boards of each size that stores in your browser.\r\n";
	for(var i=0;i<3;i++)
	{
		str+=(i==0?"Easy":(i==1?"Medium":"Hard"));
		str+="：\r\n";
		for(var j=0;j<3;j++)
		{
			str+="    ";
			str+=score[i][j][0]+"s  "+score[i][j][1];
			str+="\r\n";
		}
	}
	alert(str);
}
function Start(){
	
	width= parseInt(document.getElementById('txtwidth').value);
	height=parseInt(document.getElementById('txtheight').value);
	bombnum=parseInt(document.getElementById('txtbombnum').value);
	if(width*height>3600)
		if(!confirm("Size is soo big, continue?"))
			return;
	if (width * height < bombnum+1) {
		alert("Bombs are soo much!");
		return;
	}
	if(width!=0&&height!=0&&bombnum!=0)
	StartGame();
}
function StartGame()
{
	level=document.getElementById('levelselect').value;
	started=true;
	firstclick=false;
	var img=document.getElementById('maskimg');
	img.style.height=((height)*27+12)+"px";
	img.style.width=(width%2==0?(Math.floor(width/2)*46+6)+"px":(Math.floor(width/2)*46+28)+"px");
	EmptyData();
	ConfirmSize();
	RefreshCanvas();
	RefreshMap();
	PreparePanel();
}
function PreparePanel()
{
	time=0;
	clearInterval(interval);
	interval=setInterval("RefreshTime()",1000);
	document.getElementById('panel').style.display="block";
	document.getElementById('panel').style.width=(width%2==0?(Math.floor(width/2)*46+6)+"px":(Math.floor(width/2)*46+28)+"px");
	document.getElementById('panelleft').innerHTML=bombnum;
	document.getElementById('panelright').innerHTML="0";
	document.getElementById('caption').style.display="none";
}
function RefreshTime()
{
		time++;
		document.getElementById('panelright').innerHTML = time+"";
	
}
function GetText(i, j){
	if (Status[i][j] == 0) 
		return "";
	if (Status[i][j] == 1) 
		return '<font color="green">1</font>';
	if (Status[i][j] == 2) 
		return '<font color="blue">2</font>';
	if (Status[i][j] == 3) 
		return '<font color="red">3</font>';
	if (Status[i][j] == 4) 
		return '<font color="#A52A2A">4</font>';
	if (Status[i][j] == 5) 
		return '<font color="purple">5</font>';
	if (Status[i][j] == 6) 
		return '<font color="black">6</font>';
	if(Status[i][j]==-10)
		return '<div class="sprite flag" style="margin:0px auto 0px auto; top:3px; left:-1px; position:relative"></div>';
	if(Status[i][j]==20)
		return '<div class="sprite bomb" style="margin:0px auto 0px auto; top:3px; left:-1px; position:relative"></div>';
	return ""
}
function EmptyData(){
	data=new Array(height+2);
	for (i = 0; i < height+2; i++) {
		data[i]=new Array(width+2);
		for (j = 0; j < width+2; j++) {
			data[i][j]=0;
		}
	}
	Status=new Array(height+2);
	for (i = 0; i < height+2; i++) {
		Status[i]=new Array(width+2);
		for (j = 0; j < width+2; j++) {
			Status[i][j]=-1;
		}
	}
	mouseStatus=1;
	clickingpoint=0;
	flags=0;
	ticked=0;
}
function PrepareBomb(i,j)
{
	var t=0;
	while (true) {
		if (t == bombnum) 
			break;
		var randx = Math.floor(Math.random() * width) + 1;
		var randy = Math.floor(Math.random() * height) + 1;
		if (data[randy][randx] != 1&&(randx!=j||randy!=i)) {
			data[randy][randx] = 1;
			t++;
		}
		else {
			continue;
		}
	}
}
function ConfirmSize()
{
	var canvas=document.getElementById('canvas');
	canvas.style.width=(width%2==0?(Math.floor(width/2)*46+6)+"px":(Math.floor(width/2)*46+28)+"px");
	canvas.style.height=((height+1)*27)+"px";
	
	var img=document.getElementById('maskimg');
	
	img.style.height=((height)*27+12)+"px";
	img.style.width=(width%2==0?(Math.floor(width/2)*46+6)+"px":(Math.floor(width/2)*46+28)+"px");
	
	var v=document.getElementById('styleselect');
	if(v.value=="3d")css3d="3d";
	else if(v.value=="blank")css3d="b"
	else css3d="";
	
	var v=document.getElementById('colorselect');
	if(v.value=="green")css3d+="g";
	
	document.getElementById('shade').className="sprite mask"+css3d;
}
function RefreshCanvas(){
	var canvas = document.getElementById('canvas');
	//sth();
	var cells = document.getElementById('cells');
	var str = "";
	for (i = 1; i <= height; i++) 
		for (j = 1; j <= width; j++) {
			if (Status[i][j]<0) {
				if (j % 2 == 1) 
					str += '<div id="cell'+(i*width+j)+'" class="sprite cell' + css3d + '" style="top:' + (i * 27 - 27) + 'px; left:' + Math.floor(j / 2) * 46 + 'px;">'+GetText(i,j)+'</div>';
				if (j % 2 == 0) 
					str += '<div id="cell'+(i*width+j)+'" class="sprite cell' + css3d + '" style="top:' + (i * 27 - 14) + 'px; left:' + ((Math.floor(j / 2) - 1) * 46 + 23) + 'px;">'+GetText(i,j)+'</div>';
			}
			else {
				if (j % 2 == 1) 
					str += '<div id="cell'+(i*width+j)+'" class="sprite cellchecked' + css3d + '" style="top:' + (i * 27 - 27) + 'px; left:' + Math.floor(j / 2) * 46 + 'px;">' + GetText(i, j) + '</div>';
				if (j % 2 == 0) 
					str += '<div id="cell'+(i*width+j)+'" class="sprite cellchecked' + css3d + '" style="top:' + (i * 27 - 14) + 'px; left:' + ((Math.floor(j / 2) - 1) * 46 + 23) + 'px;">' + GetText(i, j) + '</div>';
			}
		}
	cells.innerHTML = str;
}

function RefreshMap(){
	var map=document.getElementById('map');
	var strmap="";
	for (i = 1; i <= height; i++) 
		for (j = 1; j <= width; j++) {
			if (j % 2 == 1) 
				strmap += '<area shape="poly" coords="'+
						(6+Math.floor(j / 2) * 46)+','+(i*27-29)+
					','+(21+Math.floor(j / 2) * 46)+','+(i*27-29)+
					','+(28+Math.floor(j / 2) * 46)+','+(i*27-16)+
					','+(21+Math.floor(j / 2) * 46)+','+(i*27-2)+
					','+(6+Math.floor(j / 2) * 46)+','+(i*27-2)+
					','+(Math.floor(j / 2) * 46-2)+','+(i*27-16)+
					'" href="javascript:void(0)"'+
					' onmouseover="return moving('+i+','+j+
					')" onmouseup="return clicking('+i+','+j+
					',event)" onmousedown="return mousedown('+i+','+j+
					',event)"/>';
					
				//'top:' + i * 27 + 'px; left:' + Math.floor(j / 2) * 46 + 'px;"></div>';
			if (j % 2 == 0) 
				strmap += '<area shape="poly" coords="'+
						((Math.floor(j / 2) - 1) * 46 + 28)+','+(i*27-16)+
					','+((Math.floor(j / 2) - 1) * 46 + 44)+','+(i*27-16)+
					','+((Math.floor(j / 2) - 1) * 46 + 51)+','+(i*27-2)+
					','+((Math.floor(j / 2) - 1) * 46 + 44)+','+(i*27+11)+
					','+((Math.floor(j / 2) - 1) * 46 + 28)+','+(i*27+11)+
					','+((Math.floor(j / 2) - 1) * 46 + 21)+','+(i*27-2)+
					'" href="javascript:void(0)"'+
					' onmouseover="return moving('+i+','+j+
					')" onmouseup="return clicking('+i+','+j+
					',event)" onmousedown="return mousedown('+i+','+j+
					',event)"/>';
				//top:' + (i * 27 + 13) + 'px; left:' + ((Math.floor(j / 2) - 1) * 46 + 23) + 'px;"></div>';
		}
	map.innerHTML=strmap;
}
function mousedown(i,j,e)
{
	if(!started)return;
	var button;
	if (document.all) {
		button = (e.button == 1 ? "left" : "right");
		
	}
	else {
		button = (e.which == 1 ? "left" : "right");
		
	}
	if(mouseStatus==1)
		clickingpoint=i*width+j;
	else
		if(clickingpoint!=i*width+j)
		{
			mouseStatus=1;
			return;
		}

	if(button=="left")
	mouseStatus*=2;
	else
	mouseStatus*=4;
	
}
function clicking(i,j,e)
{
	if(!started)return;
	var button;
	if (document.all) {
		button = (e.button == 1 ? "left" : "right");
		
	}
	else {
		button = (e.which == 1 ? "left" : "right");
		
	}
	if(mouseStatus==1)return;
	if(i*width+j!=clickingpoint){
		mouseStatus=1;
		return;
	}
	if(mouseStatus>1&&mouseStatus<8)mouseStatus=1;
	
		
		if (mouseStatus == 8) {
			mouseStatus *= 2;
		}
		if (mouseStatus == 16) {
			mouseStatus = 1;
			if (j % 2 == 1) {
				fun2(i,j);
				fun2(i-1,j-1);
				fun2(i - 1, j);
				fun2(i - 1, j + 1);
				fun2(i, j - 1);
				fun2(i, j + 1);
				fun2(i + 1, j);
				
			}
			else {
				fun2(i,j);
				fun2(i + 1, j - 1);
				fun2(i - 1, j);
				fun2(i + 1, j + 1);
				fun2(i, j - 1);
				fun2(i, j + 1);
				fun2(i + 1, j);
			}
			RefreshCanvas();
			moving(i,j);
		}
	
	if (Status[i][j] < 0) {
		if (button == "left") {
			if (data[i][j] == 1) 
				Bombing(i, j);
			else {
				if (!firstclick) {
					PrepareBomb(i,j);
					firstclick = true;
				}
				TickoutCell(i, j);
			}
		}
		else {
			if (Status[i][j] == -10) {
				Status[i][j] = -1;
				CheckFlag(i, j, false);
			}
			else {
				Status[i][j] = -10;
				CheckFlag(i, j, true);
			}
		}
		
		RefreshCanvas();
		moving(i, j);
		
	}
	
}
function TickoutCell(i,j)
{
	fun(i,j);
	//RefreshCanvas();
}
function fun2(i, j){
	if (Status[i][j] != -10) {
		if (data[i][j] != 1) 
			fun(i, j);
		else 
			Bombing(i, j);
	}
}
function fun(i,j)
{
	
	if(i==0||j==0||i==height+1||j==width+1)
		return;
	if(Status[i][j]>-1)
		return;
	if(j%2==1){
		var v=data[i-1][j-1];
		v+=data[i-1][j];
		v+=data[i-1][j+1];
		v+=data[i][j-1];
		v+=data[i][j+1];
		v+=data[i+1][j];
		if(v==0)
		{
			if(Status[i][j]==-1)Status[i][j]=0;
			fun(i-1,j-1);
			fun(i-1,j);
			fun(i-1,j+1);
			fun(i,j-1);
			fun(i,j+1);
			fun(i+1,j);
		}
		else
			if(Status[i][j]==-1)Status[i][j]=v;
	}
	else{
		var v=data[i+1][j-1];
		v+=data[i-1][j];
		v+=data[i+1][j+1];
		v+=data[i][j-1];
		v+=data[i][j+1];
		v+=data[i+1][j];
		if(v==0)
		{
			if(Status[i][j]==-1)Status[i][j]=0;
			fun(i+1,j-1);
			fun(i-1,j);
			fun(i+1,j+1);
			fun(i,j-1);
			fun(i,j+1);
			fun(i+1,j);
		}
		else
			if(Status[i][j]==-1)Status[i][j]=v;
	}
}
function CheckFlag(i,j,t)
{
	if(t)
	{
		ticked++;
		if(data[i][j]==1)flags++;
	}
	else{
		ticked--;
		if(data[i][j]==1)flags--;
	}
	document.getElementById('panelleft').innerHTML=bombnum-ticked;
	if(flags==ticked&&flags==bombnum)
		setTimeout("Win()",200);
}
function Bombing(i, j){
	
	Status[i][j] = 20;
	//document.getElementById('map').innerHTML = "";
	for(i=1;i<=height;i++)
		for(j=1;j<=width;j++)
		{
			if(data[i][j]==1)
				Status[i][j]=20;
		}
	RefreshCanvas();
	setTimeout("Lose()",200);
}
function Win()
{
	clearInterval(interval);
	started=false;
	alert("Great! You have won the game in "+time+" seconds!");
	if(level=="leveln")return;
	else
	{
		var n=0;
		if(level=="level2")n=1;
		else if(level=="level3")n=2;
		if (time < score[n][2][0]) {
			var name = prompt("Congratulations! Your score is among the top three scores. Please enter your name:");
			if (time > score[n][1][0]) {
				score[n][2][0] = time;
				score[n][2][1] = name;
			}
			else 
				if (time > score[n][0][0]) {
					score[n][2][0] = score[n][1][0];
					score[n][2][1] = score[n][1][1];
					score[n][1][0] = time;
					score[n][1][1] = name;
				}
				else {
					score[n][2][0] = score[n][1][0];
					score[n][2][1] = score[n][1][1];
					score[n][1][0]=score[n][0][0];
					score[n][1][1]=score[n][0][1];
					
					score[n][0][0] = time;
					score[n][0][1] = name;
				}
			SaveScore();
			ShowTable();
		}
	}
	
	document.getElementById('caption').style.display="block";
}
function Lose(){
	clearInterval(interval);
	started = false;
	alert("Sorry, you're died..");
	document.getElementById('caption').style.display="block";
}

function moving(i, j){
	if (Status[i][j] > -1 || Status[i][j] == -10) {
		document.getElementById('shade').style.display = "none";
		
	}
	else {
		document.getElementById('shade').style.display = "block";
		if (j % 2 == 1) {
			document.getElementById('shade').style.left = Math.floor(j / 2) * 46 + "px";
			document.getElementById('shade').style.top = (i * 27 - 27) + "px";
			
		//document.getElementById('mask').style.backgroundPositionY = (i * 27 - 27) + "px";
		}
		else {
			document.getElementById('shade').style.left = ((Math.floor(j / 2) - 1) * 46 + 23) + "px";
			document.getElementById('shade').style.top = (i * 27 - 14) + "px";
		//document.getElementById('mask').style.backgroundPositionY = (i * 27 + 13) + "px";
		}
	}
}
function HideCaption(i,j)
{
	if(document.getElementById('caption').style.display=='none')
		document.getElementById('caption').style.display="block";
	else
		document.getElementById('caption').style.display="none";
}
function m(str)
{
	document.getElementById('msg').innerHTML+="<br/>"+str;
}

GetScore();
