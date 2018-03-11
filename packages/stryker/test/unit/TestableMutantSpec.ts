import { expect } from 'chai';
import { Mutant } from 'stryker-api/mutant';
import TestableMutant, { TestSelectionResult } from '../../src/TestableMutant';
import { mutant, file, runResult, testResult } from './../helpers/producers';
import SourceFile from '../../src/SourceFile';
import { File } from 'stryker-api/core';

describe('TestableMutant', () => {

  let sut: TestableMutant;
  let innerMutant: Mutant;
  let innerFile: File;

  beforeEach(() => {
    innerMutant = mutant();
    innerFile = file();
    sut = new TestableMutant('3', innerMutant, new SourceFile(innerFile));
  });

  it('should pass properties from mutant and source code', () => {
    expect(sut.id).eq('3');
    expect(sut.fileName).eq(innerMutant.fileName);
    expect(sut.range).eq(innerMutant.range);
    expect(sut.mutatorName).eq(innerMutant.mutatorName);
    expect(sut.replacement).eq(innerMutant.replacement);
    expect(sut.originalCode).eq(innerFile.textContent);
  });

  it('should reflect timeSpentScopedTests, scopedTestIds and TestSelectionResult', () => {
    sut.selectAllTests(runResult({ tests: [testResult({ name: 'spec1', timeSpentMs: 12 }), testResult({ name: 'spec2', timeSpentMs: 42 })] }), TestSelectionResult.FailedButAlreadyReported);
    expect(sut.timeSpentScopedTests).eq(54);
    expect(sut.selectedTests).deep.eq([{ id: 0, name: 'spec1' }, { id: 1, name: 'spec2' }]);
    expect(sut.testSelectionResult).eq(TestSelectionResult.FailedButAlreadyReported);
  });

  it('should calculate position using sourceFile', () => {
    innerFile.textContent = 'some content';
    innerMutant.range = [1, 2];
    expect(sut.location).deep.eq({ start: { line: 0, column: 1 }, end: { line: 0, column: 2 } });
  });

  it('should return original code with mutant replacement when `mutatedCode` is requested', () => {
    innerFile.textContent = 'some content';
    innerMutant.range = [4, 5];
    innerMutant.replacement = ' mutated! ';
    expect(sut.mutatedCode).eq('some mutated! content');
  });

  it('should be able to retrieve original lines and mutated lines', () => {
    innerFile.textContent = 'line 1\nline 2\nline 3\nline 4';
    innerMutant.range = [11, 12];
    innerMutant.replacement = ' mutated! ';
    expect(sut.originalLines).eq('line 2');
    expect(sut.mutatedLines).eq('line mutated! 2');
  });
});
