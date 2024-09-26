
const canvas  = document.querySelector('canvas')

const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const scoreEl = document.querySelector('#scoreEl')
const startGameBtn = document.querySelector('#startGameBtn')
const modalEl = document.querySelector('#modalEl')
const startScoreEl = document.querySelector('#startScoreEl')


//CLASSES
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
    
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color
        c.fill()      
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius 
        this.color = color 
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color
        c.fill()      
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius 
        this.color = color 
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color
        c.fill()      
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.99 
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius 
        this.color = color 
        this.velocity = velocity
        this.alpha = 1
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color
        c.fill()   
        c.restore()   
    }

    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 15, 'white')
let projectiles = []
let enimies = []
let particles = []

function init() {
    player = new Player(x, y, 15, 'white')
    projectiles = []
    enimies = []
    particles = []
    score = 0
    scoreEl.innerHTML = score
    startScoreEl.innerHTML = score
}


function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (50 - 6) + 6

        let x
        let y

        if(Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width 
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        const angle = Math.atan2(
            canvas.height / 2 - y,
            canvas.width / 2 - x)
        //console.log(angle)
    
        const velocity = {
            x: Math.cos(angle) * 2,
            y: Math.sin(angle) *2
        }

        enimies.push(new Enemy(x, y, radius, color, velocity))
        //console.log(enimies)
    }, 1000)
}


// Animating Frames 
let animationId 
let score = 0
function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0,0, canvas.width, canvas.height)
    player.draw()
    
    //Fading the particles alpha 
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
            particle.update()
        }
    })
    projectiles.forEach((projectile, index) => {
        projectile.update()

        //removed from canvas/ screen edges
        if (projectile.x + projectile.radius < 0 || 
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(index, 1)
        }, 0)
        }
    })

    enimies.forEach((enemy, index) => {
        enemy.update()

       
       // end game 
        const dist = Math.hypot(
            player.x - enemy.x, player.y - enemy.y)
            if(dist - enemy.radius - player.radius< 1) {
                cancelAnimationFrame(animationId)
                 modalEl.style.display = 'flex'
                 startScoreEl.innerHTML = score

            }


        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(
            projectile.x - enemy.x, projectile.y - enemy.y)
            //console.log(dist)
            
            //when projectiles touch enemy 
            if(dist - enemy.radius - projectile.radius< 1) 
                {
                    //CREATE EXPLOSIONS
                    for (let i= 0; i < enemy.radius * 2; i++) {
                        particles.push(new Particle(projectile.x,
                            projectile.y, Math.random() * 2, enemy.color, {
                                x: (Math.random() - 0.5) * (Math.random() * 6),
                                y: (Math.random() - 0.5) * (Math.random() * 6)
                        })  )
                    }

                    if (enemy.radius -15 > 10) {
                        
                    //increase our score 
                    score += 50
                    scoreEl.innerHTML = score

                        gsap.to(enemy, {
                            radius: enemy.radius -15
                        })
                        setTimeout(() => {
                            projectiles.splice(projectileIndex, 1)
                    }, 0)
                    } else {
                        //remove from scene altogether
                    score += 100
                    scoreEl.innerHTML = score

                        setTimeout(() => {
                            //console.log('remove from screen');
                            enimies.splice(index, 1)
                            projectiles.splice(projectileIndex, 1)
                    }, 0)
                }  
            } 
        })
    })
}

window.addEventListener('click', (event) => {
    console.log(projectiles)
    const angle = Math.atan2(
        event.clientY - canvas.height / 2, 
        event.clientX - canvas.width / 2)
    //console.log(angle)

    const velocity = {
        x: Math.cos(angle) * 6,
        y: Math.sin(angle) * 6
    }
    projectiles.push(new Projectile(
        canvas.width / 2, 
        canvas.height / 2,
        5,
        'white',
        velocity)
    )
})

//Start of the game/ start buttton

startGameBtn.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()
    modalEl.style.display = 'none'
})