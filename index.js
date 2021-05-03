const select = document.querySelector('.opt');
const play = document.getElementById('butt');
const serverURL = "http://localhost:5000";

play.addEventListener('click', () => {
	play.style.display = 'none';
	select.style.display = 'none';
	switch (select.value) {
		case 'Minesweeper':
			minesweeper();
			break;
	}

})
async function minesweeper() {
	const res = await fetch(`${serverURL}/minesweeper`);
	if (res.status === 200) {

	}
}
function setup() {
}
