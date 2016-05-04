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

Render = function(canvas_id, size_w, size_h, walls_map, mouse_pos, field_scale, field_color, wall_color, mouse_color){
	this.canvas = document.getElementById(canvas_id);
	if(!this.canvas){
		console.log("Failed to find canvas with id: '" + canvas_id + "'!");
		return;
	}
	if(!this.canvas.getContext){
		console.log("Browser does not support canvas!");
		return;
	}
	this.ctx = this.canvas.getContext("2d");
	this.size_w = size_w;//width in amount of fields
	this.size_h = size_h;//height in amount of fields
	this.mouse_pos = mouse_pos;
	this.field_scale = field_scale;//field size divided by separator width
	this.field_color = field_color;
	this.wall_color = wall_color;
	this.walls_map = walls_map;
	this.mouse_color = mouse_color;
	this.mouse_img = new Image();
	var self = this;
	this.mouse_img.onload = function(){
		this.loaded = true;
		self.draw();
	}
	this.mouse_img.src = 'mouse.svg';//http://www.clker.com/clipart-simple-cartoon-mouse-2.html

	this.canvas.addEventListener('mousedown', function(e){
		e.preventDefault();
		self.canvas_left = self.canvas.offsetLeft;
		self.canvas_top = self.canvas.offsetTop;
		var wall = self.get_wall(e.layerX - self.canvas_left, e.layerY - self.canvas_top);
		if(wall[0] >= 0 && wall[1] >= 0){
			self.walls_map[wall[1]][wall[0]][wall[2]] = self.walls_map[wall[1]][wall[0]][wall[2]]  ? 0:1;
		}
		self.draw();
	}, false);
}

Render.prototype.get_wall = function(x, y){
	x -= this.margin_left;
	var pos_x = Math.floor(x/((this.field_scale+1)*this.scale));
	x -= ((this.field_scale+1)*this.scale)*pos_x;
	x = (x <= this.scale) ? pos_x:-1; 
	
	y -= this.margin_top;
	var pos_y = Math.floor(y/((this.field_scale+1)*this.scale));
	y -= ((this.field_scale+1)*this.scale)*pos_y;
	y = (y <= this.scale) ? pos_y:-1; 
	
	if(x >= 0 && y < 0)return [x, pos_y, 1];
	else if(y >= 0 && x < 0)return [pos_x, y, 0];
	else return [-1, -1];
}

Render.prototype.resize = function(width, height){
	this.canvas.width = this.width = width;
	this.canvas.style.width = width + "px";
	this.canvas.height = this.height = height;
	this.canvas.style.height = height + "px";
	this.canvas_left = this.canvas.offsetLeft;
	this.canvas_top = this.canvas.offsetTop;
	var field_scale = this.field_scale;
	var size_w = (this.size_w * field_scale) + (this.size_w + 1)//width in separators width
	var size_h = (this.size_h * field_scale) + (this.size_h + 1)//height separators width
	var scale_w = this.width / size_w;
	var scale_h = this.height / size_h;
	var scale = (scale_w < scale_h) ? scale_w:scale_h;
	var scale = Math.floor(scale);//separators width in pixels
	if(scale < 1){
		console.log("Unable to draw maze!");
		return;
	}
	this.scale = scale;
	this.margin_left = Math.floor((this.width - (scale * size_w))/2);
	this.margin_top = Math.floor((this.height - (scale * size_h))/2);
}


Render.prototype.draw_field = function(x, y){
	var ctx = this.ctx;
	var scale = this.scale;
	var field_scale = this.field_scale;
	var m_left = this.margin_left + (x*scale*field_scale) + ((x+1)*scale);
	var m_top = this.margin_top + (y*scale*field_scale) + ((y+1)*scale);
	var radius = 4;
	var size = field_scale*scale;
	ctx.beginPath();
	ctx.moveTo(m_left, m_top + radius);
	ctx.lineTo(m_left, m_top + size - radius);
	ctx.arcTo(m_left, m_top + size, m_left + radius, m_top + size, radius);
	ctx.lineTo(m_left + size - radius, m_top + size);
	ctx.arcTo(m_left + size, m_top + size, m_left + size, m_top + size - radius, radius);
	ctx.lineTo(m_left + size, m_top + radius);
	ctx.arcTo(m_left + size, m_top, m_left + size -radius, m_top, radius);
	ctx.lineTo(m_left + radius, m_top);
	ctx.arcTo(m_left, m_top, m_left, m_top + radius, radius);
	ctx.fill();
}

Render.prototype.draw_wall = function(x, y, dir, len){
	var ctx = this.ctx;
	var scale = this.scale;
	var field_scale = this.field_scale;
	var s_x = this.margin_left + (x*scale*field_scale) + (x*scale) + (scale/2);
	var s_y = this.margin_top + (y*scale*field_scale) + (y*scale) + (scale/2);
	var e_x = s_x + (dir ? 0:(len * scale * (field_scale + 1)));
	var e_y = s_y + (dir ? (len * scale * (field_scale + 1)):0);
	ctx.lineWidth = scale*0.2;
	ctx.lineCap = "round";
	ctx.beginPath();
	ctx.moveTo(s_x, s_y);
	ctx.lineTo(e_x, e_y);
	ctx.stroke();
}

Render.prototype.draw_mouse = function(x, y, dir){
	var ctx = this.ctx;
	var scale = this.scale;
	var field_scale = this.field_scale;
	var m_x = this.margin_left + (x*scale*field_scale) + ((x+1)*scale);
	var m_y = this.margin_top + (y*scale*field_scale) + ((y+1)*scale);
	var img = this.mouse_img;
	var self = this;
	
	ctx.save();
	var mv_x = m_x + (scale*field_scale/2);
	var mv_y = m_y + (scale*field_scale/2);
	ctx.translate(mv_x, mv_y);
	ctx.rotate((dir + 1)%4 * Math.PI/2);
	ctx.translate(-mv_x, -mv_y);
	if(img.loaded)ctx.drawImage(self.mouse_img, m_x, m_y, scale*field_scale, scale*field_scale); //Else canvas will be redrawed
	ctx.restore();
}


Render.prototype.draw = function(){
	var ctx = this.ctx;
	ctx.clearRect(0,0, this.width, this.height);
	var scale = this.scale;
	
	//Fields
	ctx.fillStyle = this.field_color;
	for(var x = 0;x < this.size_w;x++){
		for(var y = 0;y < this.size_h;y++){
			this.draw_field(x, y);
		}
	}
	
	//Outside walls
	ctx.fillStyle = this.wall_color;
	this.draw_wall(0, 0, 0, this.size_w);
	this.draw_wall(0, this.size_h, 0, this.size_w);
	this.draw_wall(0, 0, 1, this.size_h);
	this.draw_wall(this.size_w, 0, 1, this.size_h);
	
	//Walls
	var w_map = this.walls_map
	ctx.fillStyle = this.wall_color;
	for(var w = 0;w < this.size_w;w++){
		for(var h = 0;h < this.size_h;h++){
			if(w_map[h][w][0])this.draw_wall(w
			, h, 0, 1);
			if(w_map[h][w][1])this.draw_wall(w, h, 1, 1);
		}
	}
	
	//Mouse
	this.draw_mouse(this.mouse_pos[0], this.mouse_pos[1], this.mouse_pos[2]);
	
}
