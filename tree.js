// todo add support level aliases

class TreeNode {

    parent;
    value;
    children;
    aliases;

    constructor({
                    value,
                    children = [],
                    aliases = [],
                    levels = []
                }) {
        this.value = value;
        this.children = children ?? [];
        this.aliases = aliases?.map(v => `${v}`);
        this.levels = levels;
        children?.forEach(child => child.parent = this);
    }

    get path() {
        if (this.parent) {
            return `${this.parent?.path}/${this.value ?? ''}`
        } else {
            return this.value ?? '';
        }
    }

    get isLeaf() {
        return !Boolean(this.children?.length)
    }

    get isRoot() {
        return !Boolean(this.parent)
    }

    get ancestry() {
        if (this.parent) {
            return [...this.parent.ancestry, this];
        }
        return [this];
    }

    getAncestorAtLevel(level) {
        const [root, ...ancestry] = this.ancestry;
        if(root.levels.includes(level)) {
            level = root.levels.indexOf(level);
        }
        return ancestry[level];
    }

    addChild(node) {
        this.children.push(node);
    }

    find(path) {

        let matchingNodes;
        // remove leading slash
        if (path.startsWith('/')) {
            path = path.slice(1);
        }
        const [nodeMatch, ...remainingPath] = path.split('/');
        const childPath = remainingPath.join('/');

        if (nodeMatch === '*') {
            matchingNodes = this.children;
        } else if (nodeMatch.endsWith('*')) {
            const prefix = nodeMatch.slice(0, -1);
            matchingNodes = this.children.filter(({value}) => value.startsWith(prefix));
        } else {
            matchingNodes = this.children.filter(({value, aliases = []}) => nodeMatch === value || aliases.includes(nodeMatch));
        }

        if (childPath) {
            return matchingNodes.map(node => node.find(childPath)).flat();
        }

        return matchingNodes;
    }
}

class Tree {
    children;

    constructor(children = []) {
        this.children = children;
    }

    find(path) {
        return this.children.map(node => node.find(path)).flat();
    }
}

exports.TreeNode = TreeNode;
exports.Tree = Tree;

