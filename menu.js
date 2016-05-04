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

function hide_menu(e){
	var menu = e.parentNode.parentNode;
	var value = menu.hid = (menu.hid == "none") ? "inline-block":"none";
	console.log(value);
	console.log(menu.hid);
	for(var child in menu.children){
		if(menu.children[child] && menu.children[child].classList && !menu.children[child].classList.contains("title"))
		menu.children[child].style.display = value;
	}
}

function unpin_menu(e){
	var menu = e.parentNode.parentNode;
	var w = window.open("blank.html", "_blank", "toolbar=0,location=0,menubar=0,width=" + (menu.offsetWidth + 20) + ",height=" + (menu.offsetHeight + 20));
	w.onload = function(){
		w.document.getElementById("dest").appendChild(menu);
	}
	var parent = menu.parentNode;
	w.onbeforeunload = function(){
		parent.appendChild(menu);
	}
}
