module.exports={
 caseType:'permissioned_newsroom_corpus',initialState:'source_registered',
 states:['source_registered','ingestion_queued','parsed','deduplicated','indexed','retrieval_evaluated','editorial_review','publication_approved','published','correction_open','deleted'],
 createRoles:['reporter','assignment_editor'],assessmentRoles:['reporter','fact_checker','assignment_editor','standards_editor'],auditRoles:['assignment_editor','standards_editor','auditor'],connectorRoles:['integration_operator','assignment_editor'],
 evidenceKinds:['source_manifest','ingestion_checkpoint','object_digest','parser_manifest','deduplication_report','permission_snapshot','index_manifest','retrieval_evaluation','citation_resolution','conflict_report','injection_scan','fact_check_record','editorial_disposition','publish_receipt','correction_record','deletion_receipt'],
 requiredSignals:['sourceVersion','indexVersion','permissionVersion','datasetVersion','retrievalRecall','faithfulness','citationResolution','freshnessStatus','conflictStatus','injectionScanStatus','policyVersion'],
 professionalBoundary:'Retrieval output is research assistance, not publishable fact; reporters, fact-checkers, standards editors, and counsel handle verification, privilege, embargo, safety, and publication.',
 connectors:[{name:'repository_api',purpose:'resumable sources/deletions'},{name:'object_storage',purpose:'encrypted source pointers'},{name:'parser_queue',purpose:'parse/chunk receipts'},{name:'search_index',purpose:'permissioned index manifests'},{name:'cms',purpose:'signed publish/correction receipts'},{name:'wire_archive',purpose:'licensed source references'}],
 transitions:[
  {from:'source_registered',action:'queue_ingestion',to:'ingestion_queued',roles:['reporter','integration_operator'],requiresEvidence:true},
  {from:'ingestion_queued',action:'record_parse',to:'parsed',roles:['integration_operator'],requiresEvidence:true},
  {from:'parsed',action:'record_deduplication',to:'deduplicated',roles:['integration_operator'],requiresEvidence:true},
  {from:'deduplicated',action:'record_index',to:'indexed',roles:['integration_operator'],requiresEvidence:true},
  {from:'indexed',action:'record_evaluation',to:'retrieval_evaluated',roles:['fact_checker','assignment_editor'],requiresEvidence:true},
  {from:'retrieval_evaluated',action:'submit_editorial_review',to:'editorial_review',roles:['fact_checker','standards_editor'],requiresEvidence:true,dualControl:true},
  {from:'editorial_review',action:'approve_publication',to:'publication_approved',roles:['assignment_editor','standards_editor'],requiresEvidence:true,dualControl:true},
  {from:'publication_approved',action:'record_publish',to:'published',roles:['assignment_editor'],requiresEvidence:true,dualControl:true},
  {from:'published',action:'open_correction',to:'correction_open',roles:['assignment_editor','standards_editor'],requiresEvidence:true},
  {from:'source_registered',action:'confirm_deletion',to:'deleted',roles:['standards_editor'],requiresEvidence:true,dualControl:true}
 ],
 assess:x=>{const recall=Number(x.retrievalRecall),faith=Number(x.faithfulness);const metrics=[recall,faith].every(v=>Number.isFinite(v)&&v>=0&&v<=1);const ready=metrics&&recall>=.8&&faith>=.95&&x.citationResolution==='resolved'&&x.freshnessStatus==='current'&&x.conflictStatus==='resolved'&&x.injectionScanStatus==='passed';return{disposition:ready?'editorial_fact_check_required':'abstain_and_investigate',answer:null,abstain:!ready,versions:{source:x.sourceVersion,index:x.indexVersion,permissions:x.permissionVersion,dataset:x.datasetVersion}};}
};
