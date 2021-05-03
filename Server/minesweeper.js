const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());

app.listen(PORT, () => {
	console.log(`Server works at port http://localhost:${PORT}`)
})
app.get('/minesweeper', async (req, res) => {
	const height = 11, width = 20;
	var minecount = 0;
	var gameEnd = false;
	var blocks = new Array(height * width);
	var minefield = new Array(height);
	for (var i = 0; i < minefield.length; i++) {
		minefield[i] = new Array(width);
	}
	let main = document.getElementById('main')
	let grid = document.createElement('div')
	function makeField() {
		grid.classList.add('grid');
		main.appendChild(grid)
		for (var i = 0, row = -1, col = 0; i < blocks.length; i++, col++) {
			if (i % 20 === 0)
				row++;
			if (col >= 20)
				col = 0;
			const block = document.createElement('div');
			block.setAttribute('id', row + "." + col)
			grid.appendChild(block);
			blocks[i] = block;
			block.addEventListener('click', function (e) {
				clicked(block)
			}, { once: true });
		}
		return blocks;
	}
	function generateMines(mines) {
		for (var i = 0; i < mines.length; i++) {
			for (var j = 0; j < mines[i].length; j++) {
				var ran = Math.floor(Math.random() * width)
				if (ran <= 2) {
					mines[i][j] = -1;
					minecount++;
				} else
					mines[i][j] = 0;
			}
		}
		mines = setHints(mines);
		return mines;
	}
	function setHints(array) {
		for (var i = 0; i < array.length; i++) {
			level2: for (var j = 0; j < array[i].length; j++) {
				if (array[i][j] === -1) // if it's a mine
					continue;
				level3: for (var q = -1; q <= 1; q++) {
					level4: for (var z = -1; z <= 1; z++) {
						if ((j === 0) && (z === -1)) {// too far left
							continue level4;
						}
						if ((i === 0) && (q === -1)) {// too high
							continue level3;
						}
						if ((j === (array[i].length - 1)) && (z === 1)) {// too far right
							continue level3;
						}
						if ((i === (array.length - 1)) && (q === 1)) {// too low
							continue level2;
						}
						if (array[i + q][j + z] === -1)
							array[i][j] += 1;
					}
				}
			}
		}
		return array;
	}
	function openSpace(start) {
		let blanks = [start];
		top: for (var k = 0; k < blanks.length; k++) {
			outer: for (var q = -1; q <= 1; q++) {
				inner: for (var z = -1; z <= 1; z++) {
					const i = parseInt(blanks[k].split(".")[0])
					const j = parseInt(blanks[k].split(".")[1])
					let id = parseInt(`${(i * width) + j}`)
					if (blocks[id].id === `${i}.${j}`) {
						blocks[id].innerText = "";
						blocks[id].classList.replace("valid", "checked")
						if ((j === 0) && (z === -1)) {// too far left
							continue inner;
						}
						if ((i === 0) && (q === -1)) {// too high
							continue outer;
						}
						if ((j === (minefield[i].length - 1)) && (z === 1)) {// too far right
							continue outer;
						}
						if ((i === (minefield.length - 1)) && (q === 1)) {// too low
							continue top;
						}
						if (minefield[i + q][j + z] === -1) // a mine
							continue inner;
						let fixedID = parseInt(`${((i * width) + (q * width)) + (j + z)}`)
						if (minefield[i + q][j + z] > 0) {
							blocks[fixedID].innerText = minefield[i + q][j + z];
							blocks[fixedID].classList.replace("valid", "checked")
						}
						if ((minefield[i + q][j + z] === 0) && (!blocks[fixedID].classList.contains("checked")))
							blanks.push(blocks[fixedID].id)
					}
				}
			}
		}
		return blocks;
	}
	function combine() {
		for (var i = 0; i < minefield.length; i++) {
			for (var j = 0; j < minefield[i].length; j++) {
				let id = parseInt(`${(i * width) + j}`)
				if (blocks[id].id === `${i}.${j}`) {
					if (minefield[i][j] != 0) {
						if (minefield[i][j] === -1) {
							blocks[id].classList.add("bomb")
							blocks[id].innerHTML = "<img src='./bomb.jpg' height=47px width=47px>";
						}
						else {
							blocks[id].classList.add("valid")
							blocks[id].innerText = minefield[i][j];
						}
					}
					else {
						blocks[id].classList.add("valid")
						blocks[id].innerText = "";
					}
				}
			}
		}
		return blocks;
	}
	function hax() {
		for (var i = 0; i < minefield.length; i++) {
			for (var j = 0; j < minefield[i].length; j++) {
				let id = parseInt(`${(i * width) + j}`)
				if (blocks[id].id === `${i}.${j}`) {
					if (minefield[i][j] != 0) {
						if (minefield[i][j] === -1) {
							blocks[id].innerHTML = "<img src='./bomb.jpg' height=47px width=47px>";
						}
						else {
							blocks[id].classList.replace("valid", "checked")
							blocks[id].innerText = minefield[i][j];
						}
					}
					else {
						blocks[id].classList.replace("valid", "checked")
						blocks[id].innerText = "";
					}
				}
			}
		}
		return blocks;
	}
	function reveal(reveal) {
		if (!reveal) {
			for (var i = 0; i < blocks.length; i++) {
				blocks[i].innerHTML = "<img src='./question.png' height=47px width=47px>";
				blocks[i].classList.replace("checked", "valid")
			}
			return blocks;
		} else {
			blocks = combine();
			return blocks;
		}
	}
	function winState() {
		var counter = 0;
		for (var i = 0; i < minefield.length; i++) {
			for (var j = 0; j < minefield[i].length; j++) {
				let id = parseInt(`${(i * width) + j}`)
				if (blocks[id].id === `${i}.${j}`) {
					if (minefield[i][j] === -1)
						continue;
					if (blocks[id].classList.contains("checked"))
						counter++;
				}
			}
		}
		var safe = (height * width) - minecount;
		if (safe === counter)
			return true
		else
			return false
	}
	async function clicked(block) {
		if (gameEnd) return;
		const i = parseInt(block.id.split(".")[0])
		const j = parseInt(block.id.split(".")[1])
		if (minefield[i][j] === -1) {
			blocks = reveal(true)
			var audio = new Audio('boom.mp3')
			audio.play();
			await new Promise(resolve => setTimeout(resolve, 100));
			alert("GAME OVER")
			gameEnd = true;
			return;
		} else if (minefield[i][j] === 0) {
			blocks = openSpace(block.id)
		} else {
			block.innerText = minefield[i][j];
			block.classList.replace("valid", "checked")
		}
		check();
	}
	async function check() {
		if (winState() && !gameEnd) {
			blocks = reveal(true)
			const party = document.createElement('div');
			party.setAttribute('id', 'party')
			main.appendChild(party);
			for (var i = 0; i < 7; i++) {
				let dance = document.createElement('img');
				dance.setAttribute('src', './lizard.gif');
				dance.setAttribute('id', 'lizard')
				party.appendChild(dance)
			}
			var audio = new Audio('dub.mp3')
			audio.play();
			await new Promise(resolve => setTimeout(resolve, 100));
			alert("Congratulations")
			gameEnd = true;
		}
	}
	blocks = makeField();
	minefield = generateMines(minefield);
	blocks = combine();
	blocks = reveal(false);
	console.table(minefield);
	res.sendStatus(200);
});
