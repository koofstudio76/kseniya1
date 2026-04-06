const menuBtn = document.querySelector('.menu');
  
        const menuSVG = document.querySelector('.menu svg path');
        const menuItems = gsap.utils.toArray('ul li a');

        let menuOpen = false;

     

        gsap.set(menuItems, {
            yPercent: 100
        })

        const navTl = gsap.timeline({
            defaults: {
                ease: 'power4.inOut',
                duration: 1
            }
        });

        var timeline = new TimelineMax();
        timeline.from("#d_left-up", {x:'-50vw',y:-420,ease: "power1.out",duration:1,border:"red" }, 1);
        timeline.from("#d_left-down", {x:'-50vw',y:420,duration:1, ease: "power1.out", },1);
        timeline.from("#d_right-up", {x:'50vw',y:-420,ease: "power1.out",duration:1, },1);
        timeline.from("#d_right-down", {x:'50vw',y:420,duration:1, ease: "power1.out", },1);
        timeline.from(".m-item",  { x:900,opacity:0,ease: "power1.out", duration:1,stagger: {each:0.2 }});
        timeline.from("hr",  {x:0, duration:2,opacity:0,},3);
 
      
   
        gsap.to(".logo-m",  { duration:3,opacity:0,},1);

      
      
      
     

gsap.registerPlugin("ScrollTrigger");



 

gsap.to(".box1", {
   scrollTrigger: {
  trigger: "#three",
  start: "top 35%",
  end: "bottom 85%",
  scrub:4,   
   },
 scale:1.7,
 
   r:699,
  });
 gsap.to(".box2", {
    scrollTrigger: {
   trigger: ".box2",
   start: "top 175%",
   end: "bottom 95%",
   scrub:4,   
    },
    r:759,
 scaleY:1.1,
    scaleX:0.68,
    
   });

// gsap.from(".corner",{x:-290,y:433,opacity:0, ease: "power1.out",duration:4})
// gsap.from(".corner1",{x:-290,y:-433,opacity:0, ease: "power1.out",duration:4})
// gsap.from(".corner2",{x:290,y:-433,opacity:0, ease: "power1.out",duration:4})
// gsap.from(".corner3",{x:299,y:433,opacity:0, ease: "power1.out",duration:4})
// gsap.from(".text",  {ease: "power1.out", duration:2, delay: -1.5,opacity:0});
gsap.from(".span",  { y:100,opacity:0,ease: "power1.out", duration:1,stagger: {each:0.2 }});



gsap.from("body", {opacity:0, duration:2.2,});
// 3D Scroll



      
        timeline.staggerFrom(".menu ul li", 0.4, {x: -700, opacity: 0}, 0.1);
        
        timeline.reverse();
       
        menuBtn.addEventListener('click', () => {
     
        if (!menuOpen) {
         timeline.play();
             menuOpen = true;
         } else {
           timeline.reverse();
             menuOpen = false;
         }
     })
     
gsap.to(".h3", {x:-1459, duration:83,repeat:9});
gsap.to(".h4", {y:-359, duration:8,repeat:9})