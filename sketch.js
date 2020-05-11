let rocket
let population
let lifeP
let target
let count = 0
const lifespan = 200
const maxForce = 0.2
const rx = 150
const ry = 150
const rw = 100
const rh = 10

function setup() {
  createCanvas(400, 300)
  rocket = new Rocket()
  population = new Population()
  lifeP = createP()
  genP = createP()
  fitP = createP()
  target = createVector(width/2, 50)
}

function draw() {
  background(0)
  population.run()
  lifeP.html(count)
  count++
  if (count == lifespan) {
    population.evaluate()
    population.selection()
    count = 0
  }
  fill(255)
  rect(rx, ry, rw, rh)
  ellipse(target.x, target.y, 30, 30)
}

function Population() {
  this.generation = 0
  this.rockets = []
  this.popsize = 20
  this.matingPool = []

  for (let i = 0; i < this.popsize; i++) {
    this.rockets[i] = new Rocket()
  }

  this.evaluate = function() {
    let maxfit = 0
    for (let i = 0; i < this.popsize; i++) {
      this.rockets[i].calcFitness()
      if (this.rockets[i].fitness > maxfit) {
        maxfit = this.rockets[i].fitness
      }
    }

    for (let i = 0; i < this.popsize; i++) {
      this.rockets[i].fitness /= maxfit
    }

    this.matingPool = []

    for (let i = 0; i < this.popsize; i++) {
      const n = this.rockets[i].fitness * 100
      for (let j = 0; j < n; j++) {
        this.matingPool.push(this.rockets[i])
      }
    }
    genP.html(this.generation)
    this.generation++
  }

  this.selection = function() {
    const newRockets = []
    for (let i = 0; i < this.rockets.length; i++) {
      // console.log('mating pool', this.matingPool)
      const parentA = random(this.matingPool).dna
      const parentB = random(this.matingPool).dna
      const child = parentA.crossover(parentB)
      child.mutation()
      newRockets[i] = new Rocket(child)
    }
    this.rockets = newRockets
  }

  this.run = function() {
    for (let i = 0; i < this.popsize; i++) {
      this.rockets[i].update()
      this.rockets[i].show()
    }
  }
}

function DNA(genes) {
  if (genes) {
    this.genes = genes
  } else {
    this.genes = []
    for (let i = 0; i < lifespan; i++) {
      this.genes[i] = p5.Vector.random2D()
      this.genes[i].setMag(maxForce)
    }
  }


  this.crossover = function(partner) {
    const newgenes = []
    const mid = floor(random(this.genes.length))
    for (let i = 0; i < this.genes.length; i++) {
      if (i > mid) {
        newgenes[i] = this.genes[i]
      } else {
        newgenes[i] = partner.genes[i]
      }
    }
    return new DNA(newgenes)
  }

  this.mutation = function() {
    for (let i = 0; i < this.genes.length; i++) {
      if (random(1) < 0.1) {
        this.genes[i] = p5.Vector.random2D()
        this.genes[i].setMag(maxForce)
      }
    }
  }
}

function Rocket(dna) {
  this.pos = createVector(width/2, height)
  this.vel = createVector()
  this.acc = createVector()
  this.dna = dna || new DNA()
  this.fitness = 0
  this.completed = false
  this.crashed = false
  this.applyForce = function(force) {
    this.acc.add(force)
  }

  this.calcFitness = function() {
    var d = dist(this.pos.x, this.pos.y, target.x, target.y)
    this.fitness = map(d, 0, width, width, 0)
    if (this.completed) {
      this.fitness *= 100
    }
    if (this.crashed) {
      this.fitness = 1
    }
  }

  this.update = function() {
    var d = dist(this.pos.x, this.pos.y, target.x, target.y)
    if (d < 10) {
      this.completed = true
      this.pos = target.copy()
    }
    if (
      this.pos.x > rx &&
      this.pos.x < rx + rw &&
      this.pos.y > ry &&
      this.pos.y < ry + rh
    ) {
      this.crashed = true
    }
    if (this.pos.x > width || this.pos.x < 0) {
      this.crashed = true
    }
    if (this.pos.y > height || this.pos.y < 0) {
      this.crashed = true
    }
    this.applyForce(this.dna.genes[count])
    if (!this.completed && !this.crashed) {
      this.vel.add(this.acc)
      this.pos.add(this.vel)
      this.acc.mult(0)
    }
  }
  this.show = function() {
    push()
    noStroke()
    fill(255, 150)
    translate(this.pos.x, this.pos.y)
    rotate(this.vel.heading())
    rectMode(CENTER)
    rect(0, 0, 25, 5)
    pop()
  }
}
