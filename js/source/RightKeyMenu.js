function ThingsOnRightClick(event)
{
if(event.button == 2)		
						{		
						leftkey=0;	
						if 	(mouseDown[selectedi][selectedj])
						{
						
						if (selectedi == 2  || selectedi == 6  || selectedi == 7  || selectedi == 11
						 || selectedi == 12 || selectedi == 13 || selectedi == 17 || selectedi == 18
						 || selectedi == 23 || selectedi == 29 || selectedi == 33 || selectedi == 34
						 || selectedi == 5  || selectedi == 38)
						{
							
							if (selectedi == 2){
								$('#view').contextMenu('TVrightkeyMenu', 
									{
										menuStyle : 
										{
											border : '2px solid #000'
										},
										itemStyle : 
										{
											fontFamily : 'verdana',
											backgroundColor : 'white',
											color : 'black',
											border : 'none',
											padding : '3px'
								
										},
										itemHoverStyle : 
										{
											color : 'white',
											backgroundColor : 'black',
											border : 'none'
										},
										bindings : 
										{
											'item_1' : function(t) 
											{
												information(selectedi);
											},
											'item_2' : function(t) 
											{
								                if (showTV[selectedj]==1)
												    showTV[selectedj]=0;
											    else showTV[selectedj]=1;
											},
											'item_3' : function(t) 
											{
								          
											   if (showTV[selectedj]==1){
											   if (TVchannel[selectedj]<numofTVchannel)  TVchannel[selectedj]++;
											   else TVchannel[selectedj]=1;
											   }
											   else
											   {
												   alert("你必须先打开电视，才能改变频道。");
											   }
											},
											'item_4' : function(t) 
											{
												canceltype = 3;
												old = rotateAngle[selectedi][selectedj];
												oldi = selectedi;
												oldj = selectedj;
												CancelPush();
												rotateAngle[selectedi][selectedj] += 90;
											},
											'item_5' : function(t) 
											{
												canceltype = 4;
												oldi = selectedi;
												oldj = selectedj;	
												CancelPush();											
												flagThings[selectedi][selectedj] = 0;
												
											},
											'item_6' : function(t) 
											{
												
												cancel();
											}
										}
									});
								
								
								
								
								
							}
							
							else{
							      if (selectedi == 38){ 
								  
														  $('#view').contextMenu('DoorrightkeyMenu', 
															{
																menuStyle : 
																{
																	border : '2px solid #000'
																},
																itemStyle : 
																{
																	fontFamily : 'verdana',
																	backgroundColor : 'white',
																	color : 'black',
																	border : 'none',
																	padding : '3px'
														
																},
																itemHoverStyle : 
																{
																	color : 'white',
																	backgroundColor : 'black',
																	border : 'none'
																},
																bindings : 
																{
																	'item_1' : function(t) 
																	{
																		information(selectedi);
																	},
																	'item_2' : function(t) 
																	{
																	if (!DoorOpening[selectedj])
																	{
																	if (!DoorIsOpen[selectedj]) 
																	{
																	    openthedoor(selectedj);
																		DoorIsOpen[selectedj]=1;
																	}
																	else {
																		  closethedoor(selectedj);
																		  DoorIsOpen[selectedj]=0;
																	     }
																	}
																	},
																	'item_3' : function(t) 
																	{
																		canceltype = 3;
																		old = rotateAngle[selectedi][selectedj];
																		oldi = selectedi;
																		oldj = selectedj;
																		CancelPush();
																		rotateAngle[selectedi][selectedj] += 90;
																	},
																	'item_4' : function(t) 
																	{
																		canceltype = 4;
																		oldi = selectedi;
																		oldj = selectedj;	
																		CancelPush();											
																		flagThings[selectedi][selectedj] = 0;
																		
																	},
																	'item_5' : function(t) 
																	{
																		
																		cancel();
																	}
																}
															});
								                        
								                      }
													  else
											
								                      {
												            $('#view').contextMenu('rightkeyMenu3', 
															{
																menuStyle : 
																{
																	border : '2px solid #000'
																},
																itemStyle : 
																{
																	fontFamily : 'verdana',
																	backgroundColor : 'white',
																	color : 'black',
																	border : 'none',
																	padding : '3px'
														
																},
																itemHoverStyle : 
																{
																	color : 'white',
																	backgroundColor : 'black',
																	border : 'none'
																},
																bindings : 
																{
																	'item_1' : function(t) 
																	{
																		information(selectedi);
																	},
																	'item_2' : function(t) 
																	{
																		canceltype = 3;
																		old = rotateAngle[selectedi][selectedj];
																		oldi = selectedi;
																		oldj = selectedj;
																		CancelPush();
																		rotateAngle[selectedi][selectedj] += 90;
																	},
																	'item_3' : function(t) 
																	{
																		canceltype = 4;
																		oldi = selectedi;
																		oldj = selectedj;	
																		CancelPush();											
																		flagThings[selectedi][selectedj] = 0;
																		
																	},
																	'item_4' : function(t) 
																	{
																		
																		cancel();
																	}
																}
															});	
													
													}
							     }
						}
						else 
						{
						$('#view').contextMenu('rightkeyMenu', 
									{
										menuStyle : 
										{
											border : '2px solid #000'
										},
										itemStyle : 
										{
											fontFamily : 'verdana',
											backgroundColor : 'white',
											color : 'black',
											border : 'none',
											padding : '3px'
								
										},
										itemHoverStyle : 
										{
											color : 'white',
											backgroundColor : 'black',
											border : 'none'
										},
										bindings : 
										{
											'item_1' : function(t) 
											{
												information(selectedi);
											},
											'item_2' : function(t) 
											{
												canceltype = 2;
												old =  translateTexture[selectedi][selectedj];
												oldi = selectedi;
												oldj = selectedj;
												CancelPush();
												showTextureMenu(true,selectedi);
											},
											'item_3' : function(t) 
											{
												canceltype = 3;
												old = rotateAngle[selectedi][selectedj];
												oldi = selectedi;
												oldj = selectedj;
												CancelPush();
												rotateAngle[selectedi][selectedj] += 90;
											},
											'item_4' : function(t) 
											{
												canceltype = 4;
												oldi = selectedi;
												oldj = selectedj;	
												CancelPush();											
												flagThings[selectedi][selectedj] = 0;
												
											},
											'item_5' : function(t) 
											{
												
												cancel();
											}
										}
									});
						
						}
						}
						else
						{
							$('#view').contextMenu('rightkeyMenu2', 
									{
										menuStyle : 
										{
											border : '2px solid #000'
										},
										itemStyle : 
										{
											fontFamily : 'verdana',
											backgroundColor : 'white',
											color : 'black',
											border : 'none',
											padding : '3px'
								
										},
										itemHoverStyle : 
										{
											color : 'white',
											backgroundColor : 'black',
											border : 'none'
										},
										bindings : 
										{
											'item_1' : function(t) 
											{
												if (showprompt) 
												{
													prompt_check++;
													displayprompt(prompt_check);
													
												}
											},
											'item_2' : function(t) 
											{
												showceilingTextureMenu(true);
											},
											'item_3' : function(t) 
											{
												showwallTextureMenu(true);
											},
											'item_4' : function(t) 
											{
												showfloorTextureMenu(true);
											},
											'item_5' : function(t) 
											{
												cancel();
											}
											
										}
									});
						}
					}
		
}