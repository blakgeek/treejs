const {TreeNode} = require('./tree');
const assert = require('assert');
const expect = require('chai').expect;
const treeSrc = [{
    v: 'henry',
    a: [1],
    c: [{
        v: 'carlos',
        a: ['blakgeek', '2'],
        c: [{
            v: 'norah'
        }
        ]
    }, {
        v: 'althea',
        a: ['3'],
        c: [{
            v: 'maurice'
        }, {
            v: 'malik'
        }]
    }]
}, {
    v: 'sandra',
    a: ['mummy', 1],
    c: [{
        v: 'marisa',
        a: [999],
        c: [{
            v: 'norah'
        }]
    }, {
        v: 'neisha',
        a: [22],
        c: [{
            v: 'khepri'
        }, {
            v: 'cayo'
        }]
    }]
}];


describe('tree', function () {

    const tree = populate(treeSrc, [
        'grandparent',
        'parent',
        'child'
    ]);

    context('single results', function () {

        it('should find using exact path', function () {
            const matches = tree.find('henry/carlos/norah');
            assert.equal(matches.length, 1);
            const node = matches[0];
            assert.equal(node.path, '/henry/carlos/norah');
        })

        it('should support leading slash', function() {
            const matches = tree.find('/henry/carlos/norah');
            assert.equal(matches.length, 1);
            const node = matches[0];
            assert.equal(node.path, '/henry/carlos/norah');
        });

        it('should find using complete wildcards', function() {
            const matches = tree.find('/henry/*/norah');
            assert.equal(matches.length, 1);
            const node = matches[0];
            assert.equal(node.path, '/henry/carlos/norah');
        });

        it('should find using partial wildcards', function() {
            const matches = tree.find('/sandra/neis*/khe*');
            assert.equal(matches.length, 1);
            const node = matches[0];
            assert.equal(node.path, '/sandra/neisha/khepri');
        });

        it('should find using text aliases', function() {

            const matches = tree.find('/henry/blakgeek/norah');
            assert.equal(matches.length, 1);
            const node = matches[0];
            assert.equal(node.path, '/henry/carlos/norah');
        })

        it('should find using numeric aliases', function() {

            const matches = tree.find('/1/neisha/cayo');
            assert.equal(matches.length, 1);
            const node = matches[0];
            assert.equal(node.path, '/sandra/neisha/cayo');
        })
    })

    context('multiple results', function() {

        it('should find using complete wildcards', function() {
            const matches = tree.find('/henry/*/*');
            expect(matches).to.have.length(3);
            const matchedValues = matches.map(node => node.value);
            expect(matchedValues).to.have.members(['norah', 'maurice', 'malik'])


        });

        it('should find using partial wildcards', function() {
            const matches = tree.find('/henry/*/ma*');
            expect(matches).to.have.length(2);
            const matchedValues = matches.map(node => node.value);
            expect(matchedValues).to.have.members(['maurice', 'malik'])
        });

        it('should find using aliases and wildcards', function() {

            const matches = tree.find('/mummy/*');
            expect(matches).to.have.length(2);
            const matchedValues = matches.map(node => node.value);
            expect(matchedValues).to.have.members(['neisha', 'marisa'])
        })
    })

    it('should find 1st level nodes', function() {

        const matches = tree.find('/*')
        expect(matches).to.have.length(2);
        const matchedValues = matches.map(node => node.value);
        expect(matchedValues).to.have.members(['henry', 'sandra'])
    });

    context('derived properties', function() {

        it('should identify leaf nodes', function() {

            const [leaf] = tree.find('/henry/carlos/norah');
            const [notLeaf] = tree.find('/henry');
            expect(leaf.isLeaf).to.be.true;
            expect(notLeaf.isLeaf).to.be.false;
        });

        it('should identify root nodes', function() {

            const [notRoot] = tree.find('/henry');
            expect(tree.isRoot).to.be.true;
            expect(notRoot.isRoot).to.be.false;
        });

    })

    context('ancestry', function() {

        it('should return the ancestor by level', function() {

            const [node] = tree.find('/henry/carlos/norah');
            expect(node.getAncestorAtLevel(0).value).to.equal('henry');
        })

        it('should return the ancestor by level name', function() {

            const [node] = tree.find('/henry/carlos/norah');
            expect(node.getAncestorAtLevel('grandparent').value).to.equal('henry');
        })

        it('should return undefined for invalid levels', function() {

            const [node] = tree.find('/henry/carlos/norah');
            expect(node.getAncestorAtLevel(99)).to.be.undefined;
        })

    })
})

function populate(root, levels) {
    return new TreeNode({
        children: root.map(build),
        levels
    });
}


const treeSrcAlt = {
    henry: {
        aliases: [444],
        children: {
            carlos: {},
            althea: {
                children: {
                    maurice: {},
                    malik: {$aliases: [123]}
                }
            }
        }
    },
    sandra: {
        aliases: ['mummy', 888],
        children: {
            neisha: {
                aliases: [999],
                children: {
                    khepri: {},
                    cayo: {}
                }
            }
        }
    }
}

function build({c, v, a}) {
    return new TreeNode({
        value: v,
        children: c?.map(build),
        aliases: a
    });
}