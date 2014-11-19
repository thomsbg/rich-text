var Delta = require('../../lib/delta');
var expect = require('chai').expect;


describe('diff()', function () {
  it('insert', function () {
    var a = new Delta().insert('A');
    var b = new Delta().insert('AB');
    var expected = new Delta().retain(1).insert('B');
    expect(a.diff(b)).to.deep.equal(expected);
  });

  it('delete', function () {
    var a = new Delta().insert('AB');
    var b = new Delta().insert('A');
    var expected = new Delta().retain(1).delete(1);
    expect(a.diff(b)).to.deep.equal(expected);
  });

  it('retain', function () {
    var a = new Delta().insert('A');
    var b = new Delta().insert('A');
    var expected = new Delta();
    expect(a.diff(b)).to.deep.equal(expected);
  });

  it('format', function () {
    var a = new Delta().insert('A');
    var b = new Delta().insert('A', { bold: true });
    var expected = new Delta().retain(1, { bold: true });
    expect(a.diff(b)).to.deep.equal(expected);
  });

  it('embed match', function () {
    var a = new Delta().insert(1);
    var b = new Delta().insert(1);
    var expected = new Delta();
    expect(a.diff(b)).to.deep.equal(expected);
  });

  it('embed false positive', function () {
    var a = new Delta().insert(1);
    var b = new Delta().insert(String.fromCharCode(0)); // Placeholder char for embed in diff()
    var expected = new Delta().insert(String.fromCharCode(0)).delete(1);
    expect(a.diff(b)).to.deep.equal(expected);
  });

  it('error on non-documents', function () {
    var a = new Delta().insert('A');
    var b = new Delta().retain(1).insert('B');
    expect(function () {
      a.diff(b);
    }).to.throw(Error);
    expect(function () {
      b.diff(a);
    }).to.throw(Error);
  });

  it('inconvenient indexes', function () {
    var a = new Delta().insert('12', { bold: true }).insert('34', { italic: true });
    var b = new Delta().insert('123', { color: 'red' });
    var expected = new Delta().retain(2, { bold: null, color: 'red' }).retain(1, { italic: null, color: 'red' }).delete(1);
    expect(a.diff(b)).to.deep.equal(expected);
  });

  it('combination', function () {
    var a = new Delta().insert('Bad', { color: 'red' }).insert('cat', { color: 'blue' });
    var b = new Delta().insert('Good', { bold: true }).insert('dog', { italic: true });
    var expected = new Delta().insert('Good', { bold: true }).delete(2).retain(1, { italic: true, color: null }).delete(3).insert('og', { italic: true });
    expect(a.diff(b)).to.deep.equal(expected);
  });

  it('semantic', function () {
    var a = new Delta().insert('Particle man, particle man / Doing the things a particle can / What\'s he like? It\'s not important / Particle man');
    var b = new Delta().insert('Triangle man, triangle man / Triangle man hates person man / They have a fight, triangle wins / Triangle man');
    var diffRaw = a.diff(b);
    var diffSemantic = a.diff(b, true);
    var expectedSemantic = new Delta().insert('Triang').delete(6).retain(8).insert('triang').delete(6).retain(9).insert('Triangle man hates person man / They have a fight, triangle wins / Triang').delete(77);
    expect(diffRaw).to.not.equal(diffSemantic);
    expect(diffSemantic).to.deep.equal(expectedSemantic);
  });
});
