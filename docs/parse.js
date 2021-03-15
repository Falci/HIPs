#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const properties = require('properties');

const ORIGIN = path.join(__dirname, '..');
const CONTENT = path.join(__dirname, 'content');
const POSTS = path.join(CONTENT, 'proposals');
const HIP_REGEX = /HIP-[\d]{4}/i;

const formatNumber = n => String(n).padStart(4, '0');

fs.readdirSync(ORIGIN).forEach(file => {
    if (!HIP_REGEX.test(file)) {
        return;
    }

    const fullPath = path.join(ORIGIN, file);

    const isDir = fs.lstatSync(fullPath).isDirectory();
    if (isDir) {
        fs.copySync(fullPath, path.join(POSTS, file));
    } else {
        const [title, metadata, content] = fs.readFileSync(fullPath, 'UTF-8').split('```', 3);
        const props = properties.parse(metadata);

        const authors = props.Authors && props.Authors.split(';').join('","');

        const n = parseInt(props.Number.split('-')[1]);
        const newMeta = [
            `title: ${props.Title}`,
            `date: ${props.Created}`,
            `draft: ${props.Status.toLowerCase() === 'draft'}`,
            `status: "${props.Status}"`,
            `category: "${props.Type}"`,
            `authors: ["${authors || props.Author}"]`,
            `slug: "${formatNumber(n)}"`,
            `hip: "${formatNumber(n)}"`,
            '',
        ];

        const newContent = ['', newMeta.join('\n'), content].join('---\n');
        fs.writeFileSync(path.join(POSTS, file), newContent, 'UTF-8');
    }
});
