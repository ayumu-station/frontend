import {
	S3Client,
	ListBucketsCommand,
	PutObjectCommand,
	DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';
import { PNG } from 'pngjs/browser';
import { Buffer } from 'buffer';

const { S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, ENV } = env;

const client = new S3Client({
	credentials: {
		accessKeyId: S3_ACCESS_KEY_ID,
		secretAccessKey: S3_SECRET_ACCESS_KEY
	},
	region: 'ap-northeast-2',
	...(ENV === 'dev'
		? {
				endpoint: {
					url: new URL('http://localhost'),
					port: 9000
				},
				endpointProvider: (params) => {
					return { url: new URL('http://localhost:9000/station') };
				}
		  }
		: {})
});

export async function listBuckets() {
	const command = new ListBucketsCommand({});
	const res = await client.send(command);
	return res;
}

export async function uploadImage(
	key: string,
	file: Blob,
	width: number | undefined = undefined,
	height: number | undefined = undefined
) {
	const arr = new Uint8Array(await file.arrayBuffer()).subarray(0, 4);
	//https://stackoverflow.com/a/29672957
	let header = '';
	for (let i = 0; i < arr.length; i++) {
		header += arr[i].toString(16);
	}

	if (header === '89504e47') {
		const buffer = Buffer.from(await file.arrayBuffer());
		const png =
			width !== undefined || height !== undefined
				? new PNG().parse(buffer)
				: { width: undefined, height: undefined };
		if (
			(width === undefined || png.width === width) &&
			(height === undefined || png.height === height)
		) {
			return uploadFile(`${key}.png`, buffer);
		}
	} else {
		throw Error();
	}
}

export async function uploadImages(
	key: string,
	files: Blob[],
	width: number | undefined = undefined,
	height: number | undefined = undefined
) {
	let validated = true;
	const arrs: Uint8Array[] = [];
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		arrs.push(new Uint8Array(await file.arrayBuffer()));
		const arr = arrs[0].subarray(0, 4);
		let header = '';
		for (let i = 0; i < arr.length; i++) {
			header += arr[i].toString(16);
		}

		if (header === '89504e47') {
			const png =
				width !== undefined || height !== undefined
					? new PNG().parse(Buffer.from(await file.arrayBuffer()))
					: { width: undefined, height: undefined };
			if (
				(width === undefined || png.width === width) &&
				(height === undefined || png.height === height)
			) {
				validated = true;
			} else {
				validated = false;
				break;
			}
		} else {
			validated = false;
			break;
		}
	}

	if (validated) {
		for (let i = 0; i < arrs.length; i++) {
			const arr = arrs[i];
			const filePath = `${key.endsWith('/') ? key : `${key}/`}${i.toString()}.png`;
			await uploadFile(filePath, arr);
		}
	} else throw Error('Validation Failed');
}

async function uploadFile(key: string, buffer: Blob | Uint8Array) {
	const command = new PutObjectCommand({
		Bucket: 'ayumu-station',
		Key: key,
		Body: buffer
	});
	return client.send(command);
}

export async function deleteImage(key: string) {
	const command = new DeleteObjectCommand({
		Bucket: 'ayumu-station',
		Key: `${key}.png`
	});
	return client.send(command);
}
