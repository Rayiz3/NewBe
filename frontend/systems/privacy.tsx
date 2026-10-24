import policy from '@/resources/privacy-policy.json';

// Only split the document for rendering; policy wording comes from the TXT resource.
export function splitPrivacyPolicy(text: string) {
    const normalized = text.replace(/\r\n/g, '\n');
    const headings = [...normalized.matchAll(/^(\d+\. .+)$/gm)];
    return {
        introduction: normalized.slice(0, headings[0]?.index ?? normalized.length).trim(),
        sections: headings.map((match, index) => ({
            title: match[1],
            body: normalized.slice(match.index! + match[0].length,
                headings[index + 1]?.index ?? normalized.length).trim(),
        })),
    };
}

export const privacyPolicy = splitPrivacyPolicy(policy.text);
