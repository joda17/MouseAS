/*
    Mouse AS - Mouse Algorithms Simulator
    Copyright (C) 2016  Piotr Piątyszek

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var render;


var DIR = {
	LEFT: 0,
	UP: 1,
	RIGHT: 2,
	DOWN: 3,
	FRONT: 5,
	BACK: 7
}


var M = {};	// Program memory
var F = {};	// Program functions
var PI = {	// Program info
	inited: 0,
	exit: 0,
	position: [0,0,0],	// [pos x, pos y, dir of mouse front]
	start_position: [0,0,0],
	end_position: [0,0],
	running: 0,
	wall_map: []
};
var CF = {	// Control functions
	exit: function(){
		PI.exit = 1;
	},
	get_sensors: function(){
		var left = get_wall(PI.position[0], PI.position[1], (PI.position[2] + 4 - 1)%4);
		var front = get_wall(PI.position[0], PI.position[1], PI.position[2]);
		var right = get_wall(PI.position[0], PI.position[1], (PI.position[2] + 4 + 1)%4);
		return [left, front, right];
	},
	move: function(dir){
		if(dir == DIR.FRONT || dir == DIR.BACK){	// Movement
			switch(PI.position[2]){
				case DIR.LEFT:
					PI.position[0] += dir == DIR.FRONT ? -1:1;
					break;
				case DIR.RIGHT:
					PI.position[0] += dir == DIR.FRONT ? 1:-1;
					break;
				case DIR.UP:
					PI.position[1] += dir == DIR.FRONT ? -1:1;
					break;
				case DIR.DOWN:
					PI.position[1] += dir == DIR.FRONT ? 1:-1;
					break;
			}
		}
		else if(dir == DIR.LEFT){	//Rotation left
			PI.position[2] = (PI.position[2] + 4 - 1)%4;
		}
		else if(dir == DIR.RIGHT){	//Rotation right
			PI.position[2] = (PI.position[2] + 1)%4;
		}
	},
	log: function(msg){
		var logs = menus.program.ownerDocument.getElementById("form_logs_src");
		var scrolled = logs.scrollTop == logs.scrollTopMax;
		logs.innerHTML += msg + "\n";
		if(scrolled)logs.scrollTop = logs.scrollTopMax;	//Scroll only if logs was scrolled
	}
};

var menus = {};


window.onload = function(){
	render = new Render("form_maze_canvas", 16, 16, PI.wall_map, PI.position, 5, "#EEE", "#000", "#000");
	
	menus.maze = document.getElementById("menu_maze");
	menus.setup = document.getElementById("menu_setup");
	menus.program = document.getElementById("menu_program");
	
	menus.setup.ownerDocument.getElementById("form_size_reset").onclick = reset_size;
	menus.program.ownerDocument.getElementById("form_program_restart").onclick = restart;
	menus.program.ownerDocument.getElementById("form_program_single").onclick = single_move;
	menus.program.ownerDocument.getElementById("form_program_go").onclick = go;
	reset_size();
	restart();
}

function clone(obj){
	return JSON.parse(JSON.stringify(obj));
}

function save_maze(){
	var data = {};
	data.size_w = PI.size_w;
	data.size_h = PI.size_h;
	data.maze = [];
	
	//Cutting maze
	for(var y = 0;y < PI.size_h;y++){
		data.maze[y] = [];
		for(var x = 0;x < PI.size_w;x++){
			data.maze[y][x] = [PI.wall_map[y][x][0], PI.wall_map[y][x][1]];
		}
	}
	
	var w = window.open("save_page.html", "_blank", "toolbar=0,location=0,menubar=0,width=200,height=60");
	w.onload = function(){
		w.setup(data, "maze");
	}
}

function save_program(){
	var data = {};
	data.src = menus.program.ownerDocument.getElementById("form_program_src").value;
	var w = window.open("save_page.html", "_blank", "toolbar=0,location=0,menubar=0,width=200,height=60");
	w.onload = function(){
		w.setup(data, "program");
	}
}

function load_program(){
	var w = window.open("load_page.html", "_blank", "toolbar=0,location=0,menubar=0,width=200,height=60");
	w.onload = function(){
		w.setup("program", function(data){
			menus.program.ownerDocument.getElementById("form_program_src").value = data.src;
		});
	}
}

function load_maze(){
	var w = window.open("load_page.html", "_blank", "toolbar=0,location=0,menubar=0,width=200,height=60");
	w.onload = function(){
		w.setup("maze", function(data){
			menus.setup.ownerDocument.getElementById("form_size_cols").value = PI.size_w = data.size_w;
			menus.setup.ownerDocument.getElementById("form_size_rows").value = PI.size_h = data.size_h;
			render.walls_map = PI.wall_map = data.maze;
			reset_size();
		});
	}
}

function vertical(dir){
	return dir == DIR.UP || dir == DIR.DOWN;
}

function horizontal(dir){
	return dir == DIR.LEFT || dir == DIR.RIGHT;
}

function get_wall(pos_x, pos_y, dir){
	//Always return 1 for outside walls
	if(dir == DIR.UP && pos_y == 0)return 1;
	if(dir == DIR.LEFT && pos_x == 0)return 1;
	if(dir == DIR.DOWN && pos_y == PI.size_h - 1)return 1;
	if(dir == DIR.RIGHT && pos_x == PI.size_w - 1)return 1;
	//Wall map save walls at the left and the top of fields
	if(dir == DIR.DOWN)pos_y++;	//Add one to y pos to get field, that has this wall at the top
	if(dir == DIR.RIGHT)pos_x++;	//Add one to x pos to get field, that has this wall at the left
	return PI.wall_map[pos_y][pos_x][vertical(dir) ? 0:1];
}

function reset_size(){
	var width = Number.parseInt(menus.setup.ownerDocument.getElementById("form_size_width").value);
	var height = Number.parseInt(menus.setup.ownerDocument.getElementById("form_size_height").value);
	var size_w = PI.size_w = Number.parseInt(menus.setup.ownerDocument.getElementById("form_size_cols").value);
	var size_h = PI.size_h = Number.parseInt(menus.setup.ownerDocument.getElementById("form_size_rows").value);
	var wall_map = PI.wall_map;
	render.size_w = size_w;
	render.size_h = size_h;
	for(var i = 0;i < size_h;i++){
		if(!wall_map[i])wall_map[i] = [];
		for(var j = 0;j < size_w;j++){
			if(!wall_map[i][j])wall_map[i][j] = [0,0];
		}
	}
	render.resize(width, height);
	render.draw();
}

function restart(){
	PI.inited = false;
	PI.start_position[0] = Number.parseInt(menus.setup.ownerDocument.getElementById("form_pos_start_x").value);
	PI.start_position[1] = Number.parseInt(menus.setup.ownerDocument.getElementById("form_pos_start_y").value);
	PI.start_position[2] = Number.parseInt(menus.setup.ownerDocument.getElementById("form_pos_start_rotation").value);
	PI.end_position[0] = Number.parseInt(menus.setup.ownerDocument.getElementById("form_pos_end_x").value);
	PI.end_position[1] = Number.parseInt(menus.setup.ownerDocument.getElementById("form_pos_end_y").value);
	PI.position = PI.start_position;
	PI.exit = false;
	render.mouse_pos = PI.position;
	render.draw();
}

function single_move(){
	try {
		eval(menus.program.ownerDocument.getElementById("form_program_src").value);
	}
	catch(e){
		CF.log("[Running error] " + e);
	}
	if(PI.inited){
		try {
			F.loop();
		}
		catch(e){
			CF.log("[Running error] " + e);
		}
	}
	else {
		restart();
		try {
			F.init(clone(PI.start_position), clone(PI.end_position));
			PI.inited = true;
		}
		catch(e){
			CF.log("[Running error] " + e);
		}
	}
	render.mouse_pos = PI.position;
	render.draw();
}

function move(){
	if(PI.running && !PI.exit){
		single_move();
	}
	else {
		PI.running = false;
		menus.program.ownerDocument.getElementById("form_program_restart").disabled = false;
		menus.program.ownerDocument.getElementById("form_program_single").disabled = false;
		menus.program.ownerDocument.getElementById("form_program_go").innerHTML = "GO";	
	}
	setTimeout(move, 500);
}

function go(){
	if(PI.running){
		PI.running = false;
		menus.program.ownerDocument.getElementById("form_program_restart").disabled = false;
		menus.program.ownerDocument.getElementById("form_program_single").disabled = false;
		menus.program.ownerDocument.getElementById("form_program_go").innerHTML = "GO";
	}
	else {
		PI.running = true;
		menus.program.ownerDocument.getElementById("form_program_restart").disabled = true;
		menus.program.ownerDocument.getElementById("form_program_single").disabled = true;
		menus.program.ownerDocument.getElementById("form_program_go").innerHTML = "STOP";
	}
	
	setTimeout(move, 500);
}
