import { Box, Typography } from "@mui/material";

const formatAIResponse = (text) => {
    const parts = [];
    const lines = text.split('\n');

    lines.forEach((line, lineIndex) => {
        // Skip empty lines but add spacing
        if (line.trim() === '') {
            parts.push(<Box key={`spacing-${lineIndex}`} sx={{ height: 8 }} />);
            return;
        }

        // Process inline formatting (bold, italic, code)
        const processInlineFormatting = (text, key) => {
            const elements = [];
            let currentIndex = 0;

            // Regex patterns for different formatting
            const patterns = [
                { regex: /\*\*(.*?)\*\*/g, component: 'strong' }, // Bold
                { regex: /(?<!\*)\*([^*]+?)\*(?!\*)/g, component: 'em' }, // Italic (not bold)
                { regex: /`([^`]+?)`/g, component: 'code' }, // Code
            ];

            let matches = [];
            patterns.forEach(pattern => {
                let match;
                while ((match = pattern.regex.exec(text)) !== null) {
                    matches.push({
                        start: match.index,
                        end: match.index + match[0].length,
                        content: match[1],
                        component: pattern.component,
                        fullMatch: match[0]
                    });
                }
                pattern.regex.lastIndex = 0; // Reset regex
            });

            // Sort matches by start position
            matches.sort((a, b) => a.start - b.start);

            // Remove overlapping matches (keep the first one)
            const filteredMatches = [];
            for (let i = 0; i < matches.length; i++) {
                const current = matches[i];
                const hasOverlap = filteredMatches.some(existing =>
                    (current.start < existing.end && current.end > existing.start)
                );
                if (!hasOverlap) {
                    filteredMatches.push(current);
                }
            }

            filteredMatches.forEach((match, matchIndex) => {
                // Add text before the match
                if (match.start > currentIndex) {
                    elements.push(text.substring(currentIndex, match.start));
                }

                // Add the formatted element
                const elementKey = `${key}-${matchIndex}`;
                switch (match.component) {
                    case 'strong':
                        elements.push(
                            <Box key={elementKey} component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                {match.content}
                            </Box>
                        );
                        break;
                    case 'em':
                        elements.push(
                            <Box key={elementKey} component="span" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                {match.content}
                            </Box>
                        );
                        break;
                    case 'code':
                        elements.push(
                            <Box
                                key={elementKey}
                                component="span"
                                sx={{
                                    fontFamily: 'monospace',
                                    backgroundColor: 'action.hover',
                                    px: 0.5,
                                    py: 0.25,
                                    borderRadius: 0.5,
                                    fontSize: '0.85em',
                                    border: '1px solid',
                                    borderColor: 'divider'
                                }}
                            >
                                {match.content}
                            </Box>
                        );
                        break;
                    default:
                        elements.push(match.content);
                }

                currentIndex = match.end;
            });

            // Add remaining text
            if (currentIndex < text.length) {
                elements.push(text.substring(currentIndex));
            }

            return elements.length > 0 ? elements : text;
        };

        // Check if line is a header (starts with #)
        if (line.match(/^#+\s/)) {
            const headerLevel = line.match(/^#+/)[0].length;
            const headerText = line.replace(/^#+\s*/, '');
            const variant = headerLevel === 1 ? 'h6' : headerLevel === 2 ? 'subtitle1' : 'subtitle2';

            parts.push(
                <Typography
                    key={`header-${lineIndex}`}
                    variant={variant}
                    sx={{
                        fontWeight: 'bold',
                        mt: 2,
                        mb: 1,
                        color: 'text.primary'
                    }}
                >
                    {processInlineFormatting(headerText, `header-${lineIndex}`)}
                </Typography>
            );
        }
        // Check if line is a bullet point with proper markdown format
        else if (line.match(/^\s*\*\s+/)) {
            const indentLevel = (line.match(/^\s*/)[0].length / 4) || 0; // 4 spaces = 1 indent level
            const bulletText = line.replace(/^\s*\*\s+/, '');

            parts.push(
                <Box
                    key={`bullet-${lineIndex}`}
                    sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        mt: 0.5,
                        ml: indentLevel * 2 // Indent nested bullets
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            mr: 1,
                            color: 'primary.main',
                            fontWeight: 'bold',
                            minWidth: '16px'
                        }}
                    >
                        •
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, lineHeight: 1.6 }}>
                        {processInlineFormatting(bulletText, `bullet-${lineIndex}`)}
                    </Typography>
                </Box>
            );
        }
        // Check if line is a numbered list
        else if (line.match(/^\s*\d+\.\s/)) {
            const indentLevel = (line.match(/^\s*/)[0].length / 4) || 0;
            const numberMatch = line.match(/^\s*(\d+)\.\s*(.*)/);
            if (numberMatch) {
                const number = numberMatch[1];
                const listText = numberMatch[2];
                parts.push(
                    <Box
                        key={`numbered-${lineIndex}`}
                        sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            mt: 0.5,
                            ml: indentLevel * 2
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                mr: 1,
                                color: 'primary.main',
                                fontWeight: 'bold',
                                minWidth: '24px'
                            }}
                        >
                            {number}.
                        </Typography>
                        <Typography variant="body2" sx={{ flex: 1, lineHeight: 1.6 }}>
                            {processInlineFormatting(listText, `numbered-${lineIndex}`)}
                        </Typography>
                    </Box>
                );
            }
        }
        // Check if line starts with spaces followed by content (sub-items)
        else if (line.match(/^\s{2,}\S/)) {
            const indentLevel = Math.floor(line.match(/^\s*/)[0].length / 4) || 1;
            const content = line.trim();

            parts.push(
                <Box
                    key={`indent-${lineIndex}`}
                    sx={{
                        ml: indentLevel * 2,
                        mt: 0.25
                    }}
                >
                    <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
                        {processInlineFormatting(content, `indent-${lineIndex}`)}
                    </Typography>
                </Box>
            );
        }
        // Regular text line
        else {
            parts.push(
                <Typography
                    key={`text-${lineIndex}`}
                    variant="body2"
                    sx={{
                        mt: 0.5,
                        lineHeight: 1.6
                    }}
                >
                    {processInlineFormatting(line, `text-${lineIndex}`)}
                </Typography>
            );
        }
    });

    return (
        <Box sx={{ '& > *:first-of-type': { mt: 0 } }}>
            {parts}
        </Box>
    );
};

export default formatAIResponse;