import { withContentlayer } from "next-contentlayer";

/** @type {import('next').NextConfig} */
const nextConfig = {
	// use static export for all pages
	output: "export",
	pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
	experimental: {
		mdxRs: true,
	},
};

export default withContentlayer(nextConfig);
