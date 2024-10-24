<script lang="ts">
	import type { Modal } from 'bootstrap';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	export let id: string;
	export let title: string;
	export let submitButtonText = 'OK';
	export let isValid = false;
	export let onSubmit: (() => Promise<any>) | undefined = undefined;
	export let onCancel: (() => Promise<string>) | undefined = undefined;
	export let size: '' | 'sm' | 'lg' | 'xl' = '';

	let modal: Modal;
	let modalElement: HTMLElement;
	let previouslyFocusedElement: HTMLElement | null;
	let isShown = false;
	let isSubmitting = false;
	let errorMessage: string;

	let resolve: (value: any) => void;
	let reject: (reason?: any) => void;

	onMount(async () => {
		const bootstrap = await import('bootstrap');
		modal = new bootstrap.Modal(modalElement);

		modalElement.addEventListener('show.bs.modal', onShow);
		modalElement.addEventListener('shown.bs.modal', onShown);
		modalElement.addEventListener('hide.bs.modal', onHide);
		modalElement.addEventListener('hidden.bs.modal', onHidden);
	});

	export function show(): Promise<any> {
		errorMessage = '';
		modal.show();
		return new Promise<any>((resolveFunc, rejectFunc) => {
			resolve = resolveFunc;
			reject = rejectFunc;
		});
	}

	export function hide() {
		modal.hide();
	}

	function onShow() {
		isShown = true;
		previouslyFocusedElement = document.activeElement as HTMLElement;
	}

	function onShown() {
		const elements: HTMLElement[] = Array.from(modalElement.getElementsByTagName('*')).filter(
			(e) => e.tagName === 'INPUT' || e.tagName === 'BUTTON' || e.tagName === 'SELECT' || e.tagName === 'TEXTAREA'
		) as HTMLElement[];

		const element = elements.find((e) => !e.hasAttribute('disabled') || e.getAttribute('disabled') === 'false');
		element?.focus();
	}

	async function onHide() {
		if (!isSubmitting) {
			let reason = 'dialog cancelled';
			if (onCancel) {
				reason = await onCancel();
			}
			reject(reason);
		}
	}

	function onHidden() {
		previouslyFocusedElement?.focus();
		isShown = false;
	}

	async function submit() {
		try {
			errorMessage = '';
			isSubmitting = true;
			let result = undefined;
			if (onSubmit) {
				result = await onSubmit();
			}
			resolve(result);
			hide();
		} catch (error) {
			errorMessage = String(error);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<style>
	.headerfooter {
		display: flex;
		flex-shrink: 0;
		flex-wrap: nowrap;
		align-items: center;
		padding: 0px var(--bs-modal-padding);
		background-color: var(--bs-modal-fouter-bg);
	}
</style>

<form novalidate on:submit|preventDefault={submit}>
	<div bind:this={modalElement} {id} class="modal fade" data-bs-backdrop="static">
		<div
			class="modal-dialog modal-dialog-centered modal-dialog-scrollable"
			class:modal-sm={size === 'sm'}
			class:modal-lg={size === 'lg'}
			class:modal-xl={size === 'xl'}>
			<div class="modal-content">
				<div class="modal-header bg-primary">
					<h5 class="modal-title">
						{title}
					</h5>
				</div>
				<div class="headerfooter">
					<slot name="header" />
				</div>
				<div class="modal-body">
					<fieldset disabled={isSubmitting}>
						{#if isShown}
							<slot />
						{/if}
					</fieldset>
				</div>
				<div class="headerfooter">
					<slot name="footer" />
				</div>
				<div class="modal-footer">
					{#if errorMessage}
						<p class="me-auto form-text text-danger" transition:slide>{errorMessage}</p>
					{/if}
					{#if onSubmit}
						<button type="button" class="btn btn-secondary" data-bs-dismiss="modal" disabled={isSubmitting}>
							Abbrechen
						</button>
					{/if}
					<button type="submit" class="btn btn-success" disabled={!isValid || isSubmitting}>
						{#if isSubmitting}
							<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
						{:else}
							{submitButtonText}
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
</form>
