'use strict'
let spawn = document.createElement('a-entity')

spawn.setAttribute("dynamic-body", "")
spawn.setAttribute("ball-component", "")
spawn.setAttribute("data-state", "pickup")
spawn.setAttribute("class", "clickable ball")
spawn.setAttribute("physics", "restitution:3.0")
spawn.setAttribute("geometry", "primitive:sphere; radius:0.2")
spawn.setAttribute("position", "0 2 -3")
spawn.setAttribute("material", "color:blue")

AFRAME.registerComponent('ball-spawner', {
    schema:{},
    init : function(){
        const Context_AF = this; //this refers to "this" component

        Context_AF.spawnBall()
    }, 

    spawnBall : function() {
        document.getElementById("scene").appendChild(spawn)
    },
    
})