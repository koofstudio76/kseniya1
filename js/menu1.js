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
        timeline.from("#door-front", 1.3, { delay:1,duration:0.72,opacity:0, y:'-100%'});
        timeline.from("#door-front1", 1, { duration:0.52,opacity:0, y:'100%'},1);
// timeline.from("li",  {y: 200, duration:3,opacity:0, scaleY:0},2);
        timeline.from("hr",  {x:0, duration:3,opacity:0,},3);
        timeline.to(".m-item",  {ease: "power1.out", stagger: {each:0.5 }});


   gsap.from(".span",  { y:100,opacity:0,ease: "power1.out", duration:1,stagger: {each:0.2 }});
gsap.to(".mask", {r:1459, duration:2.2,});
      
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
     
// ------- Osmo [https://osmo.supply/] ------- //

document.addEventListener("DOMContentLoaded", () => {
	// Register GSAP Plugins
  gsap.registerPlugin(ScrollTrigger);
  // Parallax Layers
  document.querySelectorAll('[data-parallax-layers]').forEach((triggerElement) => {
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: "0% 0%",
        end: "100% 0%",
        scrub: 0
      }
    });
    const layers = [
      { layer: "1", yPercent: 70 },
      { layer: "2", yPercent: 55 },
      { layer: "3", yPercent: 40 },
      { layer: "4", yPercent: 10 }
    ];
    layers.forEach((layerObj, idx) => {
      tl.to(
        triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
        {
          yPercent: layerObj.yPercent,
          ease: "none"
        },
        idx === 0 ? undefined : "<"
      );
    });
  });
});
/* Lenis */
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {lenis.raf(time * 1000);});
gsap.ticker.lagSmoothing(0);