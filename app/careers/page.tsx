'use client';

import toast, { Toaster } from 'react-hot-toast';
import CareerNode from '@/components/CareerNode';
import { uploaderOptions } from '@/lib/utils';
import { UrlBuilder } from '@bytescale/sdk';
import { UploadDropzone } from '@bytescale/upload-widget-react';
import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Controls,
  addEdge,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { Node, NodeTypes } from 'reactflow';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import LoadingDots from '@/components/ui/loadingdots';
import { finalCareerInfo } from '@/lib/types';

const nodeTypes = {
  careerNode: CareerNode,
} satisfies NodeTypes;

export default function Start() {
  const [_, setName] = useState('');
  const [url, setUrl] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [careerInfo, setCareerInfo] = useState<finalCareerInfo[]>([]);
  const [additionalContext, setAdditionalContext] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (careerInfo.length === 0) return;

    const centerNode = {
      id: '1',
      position: { x: 650, y: 450 },
      data: { label: 'Careers' },
      style: { background: '#000', color: '#fff', fontSize: '20px' },
    };

    const positions = [
      { x: 50, y: 550, connectPosition: 'top' },
      { x: 1050, y: 550, connectPosition: 'top' },
      { x: 50, y: 150, connectPosition: 'bottom' },
      { x: 1050, y: 150, connectPosition: 'bottom' },
      { x: 550, y: 700, connectPosition: 'top' },
      { x: 550, y: 0, connectPosition: 'bottom' },
    ];

    const careerNodes = careerInfo.slice(0, 6).map((career, index) => ({
      id: String(index + 2),
      type: 'careerNode' as const,
      position: positions[index],
      data: {
        ...career,
        connectPosition: positions[index].connectPosition,
      },
    }));

    setNodes([centerNode, ...careerNodes]);

    const newEdges = careerNodes.map((node) => ({
      id: `e1-${node.id}`,
      source: '1',
      target: node.id,
      animated: true,
      style: { stroke: '#000' },
    }));

    setEdges(newEdges);
  }, [careerInfo]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const notify = () => toast.error('Failed to generate, please try again.');

  async function parsePdf() {
    setLoading(true);
    let response = await fetch('/api/parsePdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resumeUrl: url }),
    });
    let data = await response.json();

    let response2 = await fetch('/api/getCareers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeInfo: data,
        context: additionalContext,
      }),
    });

    if (!response2.ok) {
      console.error('Failed to fetch');
      setLoading(false);
      notify();
      return;
    }

    let data2 = await response2.json();
    setCareerInfo(data2);
    setLoading(false);
  }

  return (
    <div>
      {careerInfo.length !== 0 ? (
        <div className='w-screen h-[1200px] mx-auto'>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
          >
            <Controls />
          </ReactFlow>
        </div>
      ) : (
        <div className='p-10 mt-16 flex justify-center items-center flex-col '>
          <h1 className='text-center text-5xl mb-5 font-bold'>
            Upload your resume
          </h1>
          <p className='mb-8 text-center text-gray-600 max-w-3xl'>
            Upload your resume to get started and add any extra context below.
            We'll analyze your resume along with the interests you provide and
            provide you with 6 personalized career paths for you.
          </p>
          <UploadDropzone
            options={uploaderOptions}
            onUpdate={({ uploadedFiles }) => {
              if (uploadedFiles.length !== 0) {
                const file = uploadedFiles[0];
                const fileName = file.originalFile.file.name;
                const fileUrl = UrlBuilder.url({
                  accountId: file.accountId,
                  filePath: file.filePath,
                });
                setName(fileName);
                setUrl(fileUrl);
              }
            }}
            onComplete={() => console.log('upload complete')}
            width='695px'
            height='350px'
          />
          <Textarea
            placeholder='Describe any of your career interests and passions. This will help us match you with the right job paths (optional).'
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            className='mt-5 max-w-2xl text-base border border-gray-400 focus:border-black'
            rows={6}
          />
          <Button
            onClick={parsePdf}
            className='mt-10 text-base px-5 py-7 w-60'
            disabled={url ? false : true}
          >
            {loading ? (
              <LoadingDots style='big' color='white' />
            ) : (
              'Find your ideal career'
            )}
          </Button>
        </div>
      )}
      <Toaster />
    </div>
  );
}
