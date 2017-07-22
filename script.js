'use strict';
	window.addEventListener('load', function(){
		const body = document.querySelector('body');
		body.style.opacity = 1;
		body.style.top = '0';
});
	const time = document.querySelector('#time'),
	start_btn = document.querySelector('#start'),
	split_btn = document.querySelector('#split'),
	text1 = Array.from(document.querySelectorAll('.text:first-child')),
	text2 = Array.from(document.querySelectorAll('.text:last-child')),
	small = document.querySelector('#small>object'),
	small2 = document.querySelector('#small2>object'),
	big = document.querySelector('#big>object');
	let split_table = document.querySelector('#details tbody'),
	h, m, s, mm, interval, started = false, started_time, current, paused_gap = 0, split_adjust = 0, paused_time, temp, split_start, difference, running_total;

//check for availablity of localStorage
    const storageAvailable = (() => { try {
        var storage = window['localStorage'],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
         return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
})();

	storageAvailable && localStorage.getItem('table') && split_table.insertAdjacentHTML('afterend', localStorage.getItem('table'));

// to process and format elapsed time
	function delta(temp, wrap = true){
		mm = (temp % 1000);
		temp = (temp - mm)/ 1000;
		s = temp % 60;
		temp = (temp - s ) / 60;
		m = temp % 60;
		h = (temp - m) /60;
		mm = mm.toString().slice(0,2);
		mm= (mm > 9 ? mm : '0'+ mm);
		return (h > 9 ? h : '0'+ h) +':'+ (m > 9 ? m : '0'+ m) +':'+ (s > 9 ? s : '0'+ s) + (wrap ? '<div>'+ mm +'</div>' : '.' + mm);
	}

// to calculate elapsed time and update dom
	function timer(){
		current = Math.round(performance.now());

		if(paused_time) {
			temp = current - paused_time
			paused_gap += temp;
			split_adjust += temp;
			paused_time = 0;
		};

		temp = current - started_time - paused_gap;
		time.innerHTML = delta(temp);
	}

// to toggle button opacities and gear rotations
	function transition_toggle(play_state){
			start_btn.classList.toggle('opacity');
			split_btn.classList.toggle('opacity');
			small.style['animation-play-state'] = small2.style['animation-play-state'] = big.style['animation-play-state']= play_state;
	}
// to start stopwatch
	function start(){
		if(!started){
			transition_toggle('running');
			started = true;
			started_time = started_time || Math.round(performance.now());
			split_start = split_start || started_time;
			interval = setInterval(timer,10);
		}
	}

// to pause stopwatch
	function stop(toggle_opacity = true){
		toggle_opacity && transition_toggle('paused');
		clearInterval(interval);
		paused_time = current;
		started = false;
	}

//to record splits/laps
	function split(){
		if(started){
			difference = current - split_start - split_adjust;
			split_start = current;
			split_adjust = 0;
			split_table.innerHTML += `<tr><td></td><td>${delta(difference, false)}</td> <td>${delta(temp, false)}</td> </tr>`;
			if(storageAvailable){
				const tbody = Array.from(document.querySelectorAll('#details tbody')).map(body => body.outerHTML).join('');
				localStorage.setItem('table', tbody)
			}
		}
	}

// to reset stopwatch
	function reset(){
		stop(false);
		started_time = paused_gap = paused_time = current = split_start = 0;
		split_table.parentElement.innerHTML = `<thead><tr><td>S.No.</td> <td>Laps</td> <td>Running total</td> </tr></thead><tbody></tbody>`;
		split_table = document.querySelector('#details tbody');
		storageAvailable && localStorage.removeItem('table');
		time.innerHTML = '00:00:00<div>00</div>';
	}

start_btn.addEventListener('click', () => started ? stop() : start());
split_btn.addEventListener('click', () => started ? split() : reset());


function shortcuts(e){
	switch(e.keyCode){
		case 90:// 'z' key to start or stop
		started ? stop() : start();
		break;

		case 88: // 'x' key to split or reset
		started ? split() : reset();
		break;
	}
}
window.addEventListener('keyup',shortcuts);