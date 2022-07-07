<template>
	<div class="wrapper">
		<div class="d-flex justify-content-center">
			<input type="text" class="mr-1" v-model="urlInput" title="Spreadsheet URL">
			<input type="number" class="mr-1" v-model="min" title="Min Number">
			<input type="number" class="mr-1" v-model="max" title="Max Number">
			<input type="number" class="mr-1" min="1" v-model="column_no" title="Column No. (e.g. A =1, B =2, etc)">
			<input type="number" class="mr-1" min="1" v-model="sheet_no" title="Sheet No.">
			<input type="button" :disabled="!allValsValid" @click="fetchData" value="Fetch">
		</div>
		<div class="mt-3" style="color: #FFF; white-space: pre-line;">{{ renderResponse }}</div>
	</div>
</template>
<script>
export default {
	data() {
		return {
			response: {},
			min: 0,
			max: 1000,
			urlInput: "", // https://docs.google.com/spreadsheets/d/1dxFfoCj9X6K145D1MBTbgK2dEsFmZ7nhwNIGrVQjzDA/edit#gid=0
			column_no: 1,
			sheet_no: 1,
			urlPatt: /(?<=spreadsheets\/d\/)[a-z0-9_]+/gi
		};
	},
	mounted() {
	},
	computed: {
		allValsValid() {
			let valid = false;
			valid = ([
				(this.min >= 0),
				(this.max > this.min),
				(this.column_no >= 0),
				(this.sheet_no >= 0),
				!!(this.urlInput.match(this.urlPatt)?.length),
			].filter((item) => item).length === 5);
			return valid;
		},
		sheetId() {
			return this.urlInput.match(this.urlPatt)[0];
		},
		renderResponse() {
			let keys = Object.keys(this.response);
			if (!keys.length) {
				return "There's no response yet.";
			}
			return keys.map((item) => `Appeared ${item} times: ${this.response[item].join(", ")}`).join("\n\n");
		}
	},
	methods: {
		async fetchData() {
			const data = await fetch(`/sheet?sheet_id=${this.sheetId}&sheet_no=${this.sheet_no}&column_no=${this.column_no}&min=${this.min}&max=${this.max}`).then((res) => res.json())
			if (Object.keys(data).length) {
				this.response = data;
			} else {
				this.response = {
					"1": ["No Data."]
				}
			}
		}
	}
}
</script>

<style scoped>
input {
	border: none;
	border-radius: .2rem;
}
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button {  
   opacity: 1;
}

input[type="text"] {
	width: 30rem;
}

input[type="number"] {
    width: 5rem;
    text-align: center;
}
</style>
<style>
body {
	background: #1c1c1c;
}
#app {
	background: rgba(255, 255, 255, 0.4);
	border-radius: 1rem;
}
</style>