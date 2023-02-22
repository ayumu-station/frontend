<script lang="ts">
	import { afterUpdate, beforeUpdate, createEventDispatcher, onMount } from 'svelte';

	let prevImg: string | File = '';
	export let img: string | File = '';
	let canvas: HTMLCanvasElement;
	let image: HTMLImageElement;
	let ctx: CanvasRenderingContext2D;
	let mounted = false;
	let moveX = 0;
	let moveY = 0;
	let scaleValue = 1;
	let rotateValue = 0;

	const dispatch = createEventDispatcher();

	$: {
		if (mounted) {
			requestAnimationFrame(() => frame(moveX, moveY, scaleValue, (rotateValue * Math.PI) / 180));
		}
	}

	onMount(() => {
		const tempCtx = canvas.getContext('2d');
		if (tempCtx) {
			ctx = tempCtx;
		}
		image = document.createElement('img');
		image.onload = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(image, 0, 0);
			scaleValue = Math.max(canvas.width / image.width, canvas.height / image.height);
			moveX = (canvas.width - image.width * scaleValue) / 2;
			moveY = (canvas.height - image.height * scaleValue) / 2;
			mounted = true;
		};
	});

	afterUpdate(() => {
		if (prevImg !== img && img !== '') {
			moveX = 0;
			moveY = 0;
			scaleValue = 1;
			rotateValue = 0;
			mounted = false;
			prevImg = img;
			if (img instanceof File) {
				let fileReader = new FileReader();
				fileReader.readAsDataURL(img);
				fileReader.onload = () => {
					image.src = fileReader.result as string;
				};
			} else {
				image.src = img;
			}
		}
	});

	function frame(x: number, y: number, scale: number, rotate: number, outline = true) {
		// refer to rotate: https://stackoverflow.com/a/3793474
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.translate(x, y);
		ctx.rotate(rotate);
		ctx.scale(scale, scale);
		ctx.drawImage(image, 0, 0);
		ctx.setTransform(1, 0, 0, 1, 0, 0);

		if (outline) {
			let region = new Path2D();
			region.rect(0, 0, canvas.width, canvas.height);
			region.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
			ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
			ctx.fill(region, 'evenodd');
		}
	}

	function onMouseMove(e: MouseEvent & { currentTarget: EventTarget & HTMLCanvasElement }) {
		if (e.buttons === 1) {
			moveX += e.movementX;
			moveY += e.movementY;
			lockCanvas();
		}
	}
	function onWheel(e: WheelEvent & { currentTarget: EventTarget & HTMLCanvasElement }) {
		scaleValue += e.deltaY < 0 ? 0.05 : -0.05;
		lockCanvas();
	}

	function lockCanvas() {
		if (canvas.width > image.width * scaleValue) scaleValue = canvas.width / image.width;
		if (canvas.height > image.height * scaleValue) scaleValue = canvas.height / image.height;
		if (moveX > 0) moveX = 0;
		if (moveX < canvas.width - image.width * scaleValue)
			moveX = canvas.width - image.width * scaleValue;
		if (moveY > 0) moveY = 0;
		if (moveY < canvas.height - image.height * scaleValue)
			moveY = canvas.height - image.height * scaleValue;
	}

	function toDataURL() {
		frame(moveX, moveY, scaleValue, rotateValue, false);
		canvas.toBlob((blob) => {
			if (blob) dispatch('submit', blob);
		});
		frame(moveX, moveY, scaleValue, rotateValue, true);
	}
</script>

<div class="relative w-96 h-96">
	<canvas
		bind:this={canvas}
		width="500"
		height="500"
		class="bg-white cursor-move aspect-square w-full"
		on:mousemove={onMouseMove}
		on:wheel|preventDefault={onWheel}
	/>
	<button on:click={toDataURL} class="absolute right-2 bottom-2"
		><svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			class="w-8 h-w-8 fill-white opacity-50"
		>
			<path
				fill-rule="evenodd"
				d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
				clip-rule="evenodd"
			/>
		</svg>
	</button>
</div>
