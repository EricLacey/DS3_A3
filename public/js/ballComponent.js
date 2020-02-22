'use strict'

AFRAME.registerComponent('ball-component', {
    schema:{},
    init : function(){
        const Context_AF = this; //this refers to "this" component

        if (Context_AF.el.getAttribute("data-state") == "throw"){
            Context_AF.el.addEventListener('collide', function(e){

                if(e.detail.body.el.id == "floor"){
                    Context_AF.destroy()
                } 
                else if (e.detail.body.el.id == "portal"){
                    var event = new Event('portalThrow');
                    document.dispatchEvent(event)
                    Context_AF.destroy()
                }
                else if (e.detail.body.el.id == "basketTrigger"){
                    var event = new Event('pointsScored');
                    document.dispatchEvent(event)
                    Context_AF.destroy()
                }
            })
        }

        Context_AF.el.addEventListener('click', function(event){
            
            if (Context_AF.el.getAttribute("data-state") == "active"){
                Context_AF.throw()
            } else if (Context_AF.el.getAttribute("data-state") == "pickup"){
                Context_AF.pickup()
            }   
        });
        Context_AF.el.addEventListener('mouseenter', function(event){
            //el = element or entity
            //object3D = three.js 3D geometry object
            //scale = three.js vector that represents scale
            Context_AF.el.object3D.scale.set(1.1, 1.1, 1.1);
        });
        Context_AF.el.addEventListener('mouseleave', function(event){
            Context_AF.el.object3D.scale.set(1.0, 1.0, 1.0);
        });
        
    }, 

    pickup : function(){
        const Context_AF = this

        let camera = document.getElementById("camera")
        let spawn = document.createElement('a-entity');

        //duplicate the original object by looping through every attribute and copying it
        //https://stackoverflow.com/questions/828311/how-to-iterate-through-all-attributes-in-an-html-element
        for (var i = 0; i < Context_AF.el.attributes.length; i++) {
            var attrib = Context_AF.el.attributes[i];
            if (attrib.specified) {
                spawn.setAttribute(attrib.name, attrib.value);
            }
        }

        spawn.setAttribute("geometry", "primitive:sphere; radius:0.2")
        spawn.removeAttribute("dynamic-body")
        spawn.setAttribute("position", "0 0 -2")
        spawn.setAttribute("data-state", "active")
        document.getElementById('camera').appendChild(spawn);
        
        Context_AF.destroy()
    },

    throw : function(){
        const Context_AF = this
        let spawn = document.createElement('a-entity');

        //duplicate the original object by looping through every attribute and copying it
        //https://stackoverflow.com/questions/828311/how-to-iterate-through-all-attributes-in-an-html-element
        for (var i = 0; i < Context_AF.el.attributes.length; i++) {
            var attrib = Context_AF.el.attributes[i];
            if (attrib.specified) {
                spawn.setAttribute(attrib.name, attrib.value);
            }
        }

        //find the position of the ball, the direction of throw, create a force
        let force = new THREE.Vector3()
        let cameraPos = new THREE.Vector3()
        let ballPos = new THREE.Vector3()
        let scaleForce = 10

        Context_AF.el.object3D.getWorldPosition(ballPos);
        document.getElementById("camera").object3D.getWorldPosition(cameraPos);

        // Compute direction of force, normalize, then scale.
        force.x =ballPos.x - cameraPos.x
        force.y =ballPos.y - cameraPos.y
        force.z =ballPos.z - cameraPos.z

        ////normalize force (magnitude should always be 2 in this case)
        let vecMag = Math.sqrt(force.x**2 + force.y**2 + force.z**2)
        force.x *= 1/vecMag 
        force.y *= 1/vecMag 
        force.z *= 1/vecMag 

        ////scale force
        force.x *= scaleForce 
        force.y *= scaleForce 
        force.z *= scaleForce 
      

        spawn.setAttribute("geometry", "primitive:sphere; radius:0.2")
        spawn.setAttribute("dynamic-body", "")
        spawn.setAttribute("position", ballPos.x + " " + ballPos.y + " " + ballPos.z)
        spawn.setAttribute("data-state", "throw")
        spawn.setAttribute("velocity", {x: force.x, y: force.y, z:force.z})

        document.getElementById("scene").appendChild(spawn)

        Context_AF.destroy()

    },

    destroy : function(){
        const Context_AF = this;
        Context_AF.el.parentNode.removeChild(Context_AF.el);
    }
})