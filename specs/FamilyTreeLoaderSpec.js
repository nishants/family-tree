const
    assert = require('assert'),
    FamilyTreeLoader = require('../src/FamilyTreeLoader'),
    join = persons => persons.map(p => p.name).join(',');

describe('SeedLoader', ()=> {
  const config = {
    "families" : [
      {
        "husband": "Shan",
        "wife"   : "Anga",
        "sons"   : ["Ish", "Chit", "Vich"],
        "daughters" : ["Satya"],
      },
      {
        "husband": "Chit",
        "wife"   : "Ambi",
        "sons"   : ["Vrita", "Drita"],
        "daughters" : [],
      },
      {
        "husband": "Drita",
        "wife"   : "Jaya",
        "sons"   : ["Jata"],
        "daughters" : ["Driya"],
      },
      {
        "husband": "Minu",
        "wife"   : "Driya",
        "sons"   : [],
        "daughters" : [],
      }
    ]
  },
  familyTree = FamilyTreeLoader.load(config);

  it('should load root family', ()=> {
    const rootFamily = familyTree.getFamilyOf('Shan');

    assert.equal(rootFamily.husband.id, 'Shan');
    assert.equal(rootFamily.wife.id, 'Anga');

    assert.equal(join(rootFamily.children), "Ish,Chit,Vich,Satya");
  });

  it('should load child family', ()=> {
    const childFamily = familyTree.getFamilyOf('Chit');

    assert.equal(childFamily.husband.id, 'Chit');
    assert.equal(childFamily.wife.id, 'Ambi');

    assert.equal(join(childFamily.children), "Vrita,Drita");
  });

  it('should load grandchild family', ()=> {
    const childFamily = familyTree.getFamilyOf('Minu');

    assert.equal(childFamily.husband.id, 'Minu');
    assert.equal(childFamily.wife.id, 'Driya');

    assert.equal(join(childFamily.children), "");
  });
});