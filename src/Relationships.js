const
    Person   = require('./models/Person'),
    Family   = require('./models/Family'),
    males    = person => person.isMale,
    females  = person => !person.isMale,
    not      = personId => (person) => !person.is(personId),
    existing = p=> !!p,
    known    = p=> !p.isUnknown();

class Relationships{
  constructor(familyTree){
    this.familyTree = familyTree;
  }

  fatherOf(personId){
    return this.familyTree
        .getParentFamilyOf(personId)
        .husband;
  }

  motherOf(personId){
    return this.familyTree
        .getParentFamilyOf(personId)
        .wife;
  }

  childrenOf(personId){
    return this.familyTree
        .getFamilyOf(personId)
        .children;
  }

  daughtersOf(personId){
    return this.childrenOf(personId).filter(females);
  }

  sonsOf(personId){
    return this.childrenOf(personId).filter(males);
  }

  siblingsOf(personId){
    return this.familyTree
        .getParentFamilyOf(personId)
        .children
        .filter(not(personId));
  }

  spouseOf(personId){
    const family = this.familyTree.getFamilyOf(personId);
    return !family.husband ? null : family.husband.is(personId) ? family.wife : family.husband;
  }

  fathersSiblings(personId){
    const parentFamily = this.familyTree.getParentFamilyOf(personId);
    return this.siblingsOf(parentFamily.husband.id);
  }

  mothersSiblings(personId){
    const parentFamily = this.familyTree.getParentFamilyOf(personId);
    return this.siblingsOf(parentFamily.wife.id);
  }

  paternalUnclesOf(personId){
    const father = this.fatherOf(personId);
    return this.brothersOf(father.id)
            .concat(this.brotherInLawsOf(father.id));
  }

  maternalUnclesOf(personId){
    const mother = this.motherOf(personId);
    return this.brothersOf(mother.id)
        .concat(this.brotherInLawsOf(mother.id));
  }

  unclesOf(personId){
    const uncles = this.paternalUnclesOf(personId)
        .concat(this.maternalUnclesOf(personId));
    return uncles.filter((uncle, index) => uncles.indexOf(uncle) === index);
  }

  auntsOf(personId){
    const aunts = this.paternalAuntsOf(personId)
        .concat(this.maternalAuntsOf(personId));
    return aunts.filter((aunt, index) => aunts.indexOf(aunt) === index);
  }

  maternalAuntsOf(personId){
    const mother = this.motherOf(personId);
    return this.sistersOf(mother.id)
        .concat(this.sisterInLawsOf(mother.id));
    }

  paternalAuntsOf(personId){
    const father = this.fatherOf(personId);
    return this.sistersOf(father.id)
        .concat(this.sisterInLawsOf(father.id));
  }

  cousinsOf(personId){
    return this.mothersSiblings(personId)
        .concat(this.fathersSiblings(personId))
        .reduce((cousins, person) => cousins.concat(this.childrenOf(person.id)), []);
  }

  brotherInLawsOf(personId) {
    const
        husbandOfSisters = this.siblingsOf(personId).filter(females)
            .map((sister) => this.familyTree.getFamilyOf(sister.id).husband)
            .filter(existing),
        spouse =  this.spouseOf(personId),
        brothersOfSpouse= !spouse ? [] : this.brothersOf(spouse.id);

    return husbandOfSisters.concat(brothersOfSpouse);
  }

  sisterInLawsOf(personId){
    const
        wivesOfBrother = this.siblingsOf(personId).filter(males)
            .map((brother) => this.familyTree.getFamilyOf(brother.id).wife),
        spouse =  this.spouseOf(personId),
        sistersOfSpouse= !spouse ? [] : this.sistersOf(spouse.id);

    return wivesOfBrother.concat(sistersOfSpouse);
  }

  brothersOf(personId){
    return this.siblingsOf(personId).filter(males);
  }

  sistersOf(personId){
    return this.siblingsOf(personId).filter(females);
  }

  grandChildrenOf(personId){
    return this.familyTree
        .getFamilyOf(personId)
        .children
        .reduce((childFamilies, child) => childFamilies.concat(this.familyTree.getFamilyOf(child.id)), [])
        .reduce((grandChildren, family) => grandChildren.concat(family.children), []);
  }

  grandDaughterOf(personId){
    return this.grandChildrenOf(personId).filter(females);
  }

  grandSonOf(personId){
    return this.grandChildrenOf(personId).filter(males);
  }

  grandFatherOf(personId){
    return [this.fatherOf(this.fatherOf(personId).id),
      this.fatherOf(this.motherOf(personId).id)]
        .filter(known);
  }

  grandMotherOf(personId){
    return [this.motherOf(this.fatherOf(personId).id),
            this.motherOf(this.motherOf(personId).id)]
        .filter(known);
  }

  addSon(motherId, sonsName){
    this.familyTree.addChild(motherId, new Person(sonsName, true));
  }

  addDaughter(motherId, daughterName){
    this.familyTree.addChild(motherId, new Person(daughterName, false));
  }

  motherWithMostDaughter(){
    const
        allFamilies = this.familyTree.getAllFamilies(),
        mostDaughters = allFamilies.reduce(
            (daughters, family)=> Math.max(daughters, family.children.filter(females).length), 0
        );

    return allFamilies.filter(f => f.children.filter(females).length === mostDaughters).map(f => f.wife);
  }

  addSpouse(husbandId, wifeId){
    this.familyTree.addFamily(new Family(new Person(husbandId, true), new Person(wifeId, true), []));
  }
}

module.exports =  Relationships;