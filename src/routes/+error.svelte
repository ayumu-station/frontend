<script lang="ts">
	import { page } from '$app/stores';
</script>

<img src={`https://http.cat/${$page.status}.jpg`} alt="status" />
<p>{$page.error?.message}</p>
